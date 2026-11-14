"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var Shared = require("./shared.js");

var PORT = process.env.PORT || 3000;
var DATA_DIR = process.env.DATA_DIR || __dirname;
var FILE = path.join(DATA_DIR, "data.json");

var db = { users: {}, tokens: {}, matches: {}, nextId: 1 };
try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch (e) { /* first run */ }
db.rooms = db.rooms || {};
var dirty = false;
function save() { dirty = true; }
function flush() {
  if (!dirty) return;
  dirty = false;
  try { fs.writeFileSync(FILE + ".tmp", JSON.stringify(db)); fs.renameSync(FILE + ".tmp", FILE); } catch (e) { console.error("Save failed:", e.message); }
}
setInterval(flush, 2000);
process.on("SIGTERM", function () { flush(); process.exit(0); });
process.on("SIGINT", function () { flush(); process.exit(0); });

/* ---------- helpers ---------- */
function send(res, code, obj) {
  var body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  res.end(body);
}
function fail(res, code, msg) { send(res, code, { error: msg }); }
function readBody(req, cb) {
  var raw = "";
  req.on("data", function (c) { raw += c; if (raw.length > 30000) req.destroy(); });
  req.on("end", function () { try { cb(raw ? JSON.parse(raw) : {}); } catch (e) { cb(null); } });
}
function hashPw(pw, salt) { return crypto.scryptSync(pw, salt, 32).toString("hex"); }
function sameHash(a, b) { var x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function userOf(req) {
  var t = req.headers["x-token"];
  var rec = t && db.tokens[t];
  if (!rec || Date.now() - rec.at > 30 * 24 * 3600 * 1000 || !db.users[rec.user]) return "";
  return rec.user;
}
var fails = {};
function tooManyFails(ip) { var f = fails[ip]; return f && f.n >= 10 && Date.now() - f.at < 10 * 60 * 1000; }
function noteFail(ip) { var f = fails[ip]; if (!f || Date.now() - f.at > 10 * 60 * 1000) f = fails[ip] = { n: 0, at: Date.now() }; f.n++; }

function pub(name) {
  var u = db.users[name];
  return { name: name, created: u.created, wins: u.wins, losses: u.losses, ties: u.ties || 0, points: u.points || 0, friends: u.friends };
}
function mine(name) { var p = pub(name); p.inv = db.users[name].inv; return p; }
function issueToken(name) {
  var t = crypto.randomBytes(24).toString("hex");
  db.tokens[t] = { user: name, at: Date.now() };
  save();
  return t;
}

/* ---------- matches ---------- */
function makeSub(m, code) {
  var r = Shared.analyze(code, m.task);
  return { code: code, total: r.total, groups: r.groups, zero: r.zero, at: Date.now() };
}
function finish(m) {
  if (m.status === "done") return;
  m.status = "done";
  if (m.players.length === 2) {
    var a = m.subs[m.players[0]].total, b = m.subs[m.players[1]].total;
    if (a !== b) {
      var w = a > b ? 0 : 1;
      db.users[m.players[w]].wins++;
      db.users[m.players[1 - w]].losses++;
      m.winner = m.players[w];
    } else {
      m.winner = "";
      m.players.forEach(function (q) { db.users[q].ties = (db.users[q].ties || 0) + 1; });
    }
  }
  save();
}
function settle(m) {
  var now = Date.now();
  if (m.status === "invite" && now - m.created > 10 * 60 * 1000) { m.status = "expired"; save(); }
  if (m.status === "active" && now > m.startedAt + m.limit * 1000 + 20000) {
    m.players.forEach(function (p) { if (!m.subs[p]) m.subs[p] = makeSub(m, ""); });
    finish(m);
  }
}
function matchView(m, user) {
  var out = {
    id: m.id, mode: m.players.length === 1 ? "solo" : "versus", players: m.players,
    task: m.task.t, cat: m.task.cat, diff: m.diff, limit: m.limit, status: m.status,
    startedAt: m.startedAt, serverNow: Date.now(), mySub: null, oppSubmitted: false
  };
  var s = m.subs[user];
  if (s) out.mySub = { total: s.total, groups: s.groups, zero: s.zero };
  if (m.players.length === 2) { var other = m.players[0] === user ? m.players[1] : m.players[0]; out.oppSubmitted = !!m.subs[other]; }
  if (m.status === "done") {
    out.results = m.players.map(function (p) { return { name: p, total: m.subs[p].total }; });
    out.winner = m.winner || "";
  }
  return out;
}
function myMatches(user) {
  return Object.keys(db.matches).map(function (k) { return db.matches[k]; }).filter(function (m) { return m.players.indexOf(user) > -1; });
}


/* ---------- rooms ---------- */
var COLOURS = ["red", "blue", "green", "yellow"];
function cleanDiff(d) { return ["easy", "normal", "hard"].indexOf(d) > -1 ? d : "normal"; }
function cleanCat(c) { return Shared.CATS.indexOf(c) > -1 ? c : "Any"; }
function cleanMins(n) { return Math.max(1, Math.min(60, parseInt(n, 10) || 10)); }
function createMatch(players, diff, cat, mins) {
  var pool = Shared.TASKS.filter(function (t) { return t.d === diff && (cat === "Any" || t.cat === cat); });
  var id = String(db.nextId++);
  var m = { id: id, players: players, task: pool[Math.floor(Math.random() * pool.length)], diff: diff, limit: mins * 60, status: "active", created: Date.now(), startedAt: Date.now(), subs: {} };
  db.matches[id] = m;
  save();
  return m;
}
function openMatches(user) { return myMatches(user).filter(function (m) { settle(m); return m.status === "active"; }).length; }
function leaveRooms(user) {
  Object.keys(db.rooms).forEach(function (k) {
    var r = db.rooms[k];
    if (r.status === "active") return;
    if (r.host === user) delete db.rooms[k];
    else if (r.guest === user) { r.guest = ""; r.status = "open"; }
  });
}
function roomView(r) {
  return { code: r.code, colour: r.colour, host: r.host, guest: r.guest, status: r.status, matchId: r.matchId, diff: r.diff, cat: r.cat, minutes: r.limit / 60 };
}
setInterval(function () {
  var now = Date.now();
  Object.keys(db.rooms).forEach(function (k) {
    var r = db.rooms[k], age = now - r.created;
    if ((r.status !== "active" && age > 30 * 60 * 1000) || age > 3 * 3600 * 1000) { delete db.rooms[k]; save(); }
  });
}, 60000);

/* ---------- API ---------- */
function handle(req, res, p, body) {
  var ip = req.socket.remoteAddress || "";
  var m1;

  if (req.method === "GET" && p === "/api/stats") return send(res, 200, { players: Object.keys(db.users).length });

  if (req.method === "POST" && (p === "/api/register" || p === "/api/login")) {
    if (tooManyFails(ip)) return fail(res, 429, "Too many tries. Wait a few minutes.");
    var name = String(body.username || "").trim().toLowerCase(), a = String(body.password || ""), b = String(body.confirm || "");
    if (p === "/api/register") {
      if (!/^[a-z0-9_]{3,20}$/.test(name)) return fail(res, 400, "Username: 3 to 20 letters, numbers or _ (it is saved in lowercase).");
      if (db.users[name]) return fail(res, 400, "That username is taken.");
      if (!/^[0-9]{8}$/.test(a)) return fail(res, 400, "The password must be exactly 8 digits.");
      if (a !== b) return fail(res, 400, "The two passwords don't match.");
      var salt = crypto.randomBytes(16).toString("hex");
      db.users[name] = { salt: salt, hash: hashPw(a, salt), created: new Date().toISOString(), wins: 0, losses: 0, ties: 0, points: 0, friends: [], inv: [] };
      save();
      return send(res, 200, { token: issueToken(name), me: mine(name) });
    }
    var u = db.users[name];
    if (!u || !sameHash(u.hash, hashPw(a, u.salt))) { noteFail(ip); return fail(res, 401, "Wrong username or password."); }
    return send(res, 200, { token: issueToken(name), me: mine(name) });
  }

  var user = userOf(req);
  if (!user) return fail(res, 401, "Please log in.");

  if (req.method === "POST" && p === "/api/logout") { delete db.tokens[req.headers["x-token"]]; save(); return send(res, 200, {}); }
  if (req.method === "GET" && p === "/api/me") return send(res, 200, mine(user));

  if (req.method === "GET" && (m1 = p.match(/^\/api\/users\/([a-z0-9_]{3,20})$/))) {
    if (!db.users[m1[1]]) return fail(res, 404, "No user with that name.");
    return send(res, 200, pub(m1[1]));
  }

  if (req.method === "POST" && p === "/api/friends/add") {
    var fn = String(body.name || "").trim().toLowerCase();
    if (!db.users[fn]) return fail(res, 404, "No user with that name.");
    if (fn === user) return fail(res, 400, "You can't add yourself.");
    if (db.users[user].friends.indexOf(fn) > -1) return fail(res, 400, "Already in your friends.");
    db.users[user].friends.push(fn); save();
    return send(res, 200, {});
  }
  if (req.method === "POST" && p === "/api/friends/remove") {
    var rn = String(body.name || "");
    db.users[user].friends = db.users[user].friends.filter(function (x) { return x !== rn; }); save();
    return send(res, 200, {});
  }
  if (req.method === "POST" && p === "/api/inventory/delete") {
    db.users[user].inv = db.users[user].inv.filter(function (x) { return x.id !== body.id; }); save();
    return send(res, 200, {});
  }

  if (req.method === "POST" && p === "/api/match/new") {
    if (openMatches(user) >= 5) return fail(res, 400, "Finish your open matches first.");
    var sm = createMatch([user], cleanDiff(body.diff), cleanCat(body.cat), cleanMins(body.minutes));
    return send(res, 200, { id: sm.id });
  }

  if (req.method === "GET" && p === "/api/lobby") {
    var L = { active: [] };
    myMatches(user).forEach(function (m) {
      settle(m);
      if (m.status === "active" && !m.subs[user]) L.active.push({ id: m.id, mode: m.players.length === 1 ? "solo" : "versus", diff: m.diff, cat: m.task.cat });
    });
    return send(res, 200, L);
  }

  /* ----- rooms: create, join with code + colour, host starts ----- */
  if (req.method === "POST" && p === "/api/room/create") {
    leaveRooms(user);
    var code;
    do { code = String(1000 + Math.floor(Math.random() * 9000)); } while (db.rooms[code]);
    var colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    db.rooms[code] = { code: code, colour: colour, host: user, guest: "", status: "open", matchId: "", diff: cleanDiff(body.diff), cat: cleanCat(body.cat), limit: cleanMins(body.minutes) * 60, created: Date.now() };
    save();
    return send(res, 200, { code: code, colour: colour });
  }
  if (req.method === "POST" && p === "/api/room/join") {
    var jkey = ip + ":join";
    if (tooManyFails(jkey)) return fail(res, 429, "Too many wrong tries. Wait a few minutes.");
    var rc = String(body.code || ""), rcol = String(body.colour || "").toLowerCase();
    var room = db.rooms[rc];
    if (!room || room.colour !== rcol || room.status !== "open" || room.host === user) { noteFail(jkey); return fail(res, 404, "No open room with that code and colour."); }
    leaveRooms(user);
    room.guest = user; room.status = "ready"; save();
    return send(res, 200, { code: rc });
  }
  var rm = p.match(/^\/api\/room\/(\d{4})(\/(start|leave))?$/);
  if (rm) {
    var r2 = db.rooms[rm[1]];
    if (!r2 || (r2.host !== user && r2.guest !== user)) return fail(res, 404, "Room not found.");
    var ract = rm[3];
    if (req.method === "GET" && !ract) return send(res, 200, roomView(r2));
    if (req.method !== "POST") return fail(res, 405, "Not allowed.");
    if (ract === "start") {
      if (r2.host !== user) return fail(res, 403, "Only the host can start.");
      if (r2.status !== "ready") return fail(res, 400, "Wait for a friend to join first.");
      var mt = createMatch([r2.host, r2.guest], r2.diff, r2.cat, r2.limit / 60);
      r2.status = "active"; r2.matchId = mt.id; save();
      return send(res, 200, { matchId: mt.id });
    }
    if (ract === "leave") {
      if (r2.status !== "active") {
        if (r2.host === user) delete db.rooms[r2.code]; else { r2.guest = ""; r2.status = "open"; }
        save();
      }
      return send(res, 200, {});
    }
  }

  var mm = p.match(/^\/api\/match\/(\d+)(\/(submit))?$/);
  if (mm) {
    var m = db.matches[mm[1]];
    if (!m || m.players.indexOf(user) < 0) return fail(res, 404, "Match not found.");
    settle(m);
    if (req.method === "GET" && !mm[3]) return send(res, 200, matchView(m, user));
    if (req.method === "POST" && mm[3] === "submit") {
      if (m.status !== "active") return fail(res, 400, "This match is over.");
      if (m.subs[user]) return fail(res, 400, "You already submitted.");
      var code2 = String(body.code || "").slice(0, 5000);
      var sub = makeSub(m, code2);
      m.subs[user] = sub;
      db.users[user].points = (db.users[user].points || 0) + sub.total;
      if (sub.total > 0) {
        var inv = db.users[user].inv;
        inv.unshift({ id: crypto.randomBytes(6).toString("hex"), task: m.task.t, diff: m.diff, code: code2, total: sub.total, date: new Date().toISOString() });
        if (inv.length > 100) inv.length = 100;
      }
      if (m.players.every(function (q) { return m.subs[q]; })) finish(m);
      save();
      return send(res, 200, { sub: { total: sub.total, groups: sub.groups, zero: sub.zero }, status: m.status });
    }
    return fail(res, 405, "Not allowed.");
  }
  return fail(res, 404, "Not found.");
}

/* ---------- server ---------- */
var STATIC = {
  "/": ["public/index.html", "text/html; charset=utf-8"],
  "/index.html": ["public/index.html", "text/html; charset=utf-8"],
  "/shared.js": ["shared.js", "application/javascript; charset=utf-8"]
};
http.createServer(function (req, res) {
  var p = req.url.split("?")[0];
  if (p.indexOf("/api/") === 0) {
    if (req.method === "POST") {
      return readBody(req, function (body) {
        if (!body) return fail(res, 400, "Bad request.");
        try { handle(req, res, p, body); } catch (e) { console.error(e); fail(res, 500, "Server error."); }
      });
    }
    try { return handle(req, res, p, {}); } catch (e) { console.error(e); return fail(res, 500, "Server error."); }
  }
  var f = STATIC[p];
  if (!f) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(path.join(__dirname, f[0]), function (err, data) {
    if (err) { res.writeHead(500); return res.end("Error"); }
    res.writeHead(200, { "Content-Type": f[1] });
    res.end(data);
  });
}).listen(PORT, "0.0.0.0", function () { console.log("Code Duel running on port " + PORT); });
