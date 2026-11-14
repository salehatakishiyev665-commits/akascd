"use strict";
/* Shared by the server (scoring) and the page (category list). */
(function (root) {
/* Tasks are built from templates plus parameter lists: {a} and {b} are filled in. */
var CATS = ["Math", "Strings", "Lists", "Patterns", "Mini games"];
var TASKS = [];
function R(a, b, s) { var o = []; for (var i = a; i <= b; i += (s || 1)) o.push(i); return o; }
function G(cat, d, tpl, A, B) {
  A.forEach(function (a) {
    (B || [""]).forEach(function (b) {
      TASKS.push({ cat: cat, d: d, t: tpl.split("{a}").join(a).split("{b}").join(b) });
    });
  });
}
var VOW = ["a", "e", "i", "o", "u"], CON = ["b", "c", "d", "l", "m", "n", "r", "s"];
var LET = "abcdefghijklmnopqrstuvwxyz".split("");

G("Math", "easy", "Ask for a number and print it multiplied by {a}.", R(2, 25));
G("Math", "easy", "Print all multiples of {a} up to {b}.", R(2, 12), [30, 50, 100, 200]);
G("Math", "easy", "Ask for a number and print whether it is divisible by {a}.", R(2, 20));
G("Math", "normal", "Write a function that returns the sum of all numbers from 1 to {a}, then print the result.", R(10, 200, 5));
G("Math", "normal", "Print every number from 1 to {a} that is divisible by {b}.", [30, 50, 100, 150, 200], R(3, 12));
G("Math", "normal", "Write a function that returns True if a number is divisible by both {a} and {b}, then print the result for a typed number.", R(2, 9), R(10, 19));
G("Math", "hard", "Print all prime numbers up to {a}.", R(30, 300, 10));
G("Math", "hard", "Write a function that returns the {a}-th Fibonacci number using a loop, then print the first {a} Fibonacci numbers.", R(8, 40));
G("Math", "hard", "Print all numbers up to {a} whose digits add up to {b}.", [100, 200, 500, 1000], R(5, 18));
G("Math", "hard", "Write a function that returns the factorial of a number, then print the factorials of 1 to {a}.", R(5, 25));

G("Strings", "easy", "Ask for a word and print it repeated {a} times.", R(2, 15));
G("Strings", "easy", "Ask for a word and print its first {a} letters and its last {b} letters.", R(1, 4), R(1, 4));
G("Strings", "normal", "Write a program that counts how many times the letter '{a}' appears in a word typed by the user.", LET);
G("Strings", "normal", "Write a function that checks if a typed word starts with '{a}' and ends with '{b}', then print the result.", VOW, CON);
G("Strings", "normal", "Write a function that returns a word with every '{a}' replaced by '{b}', then print the result for a typed word.", VOW, ["*", "#", "-", "_", "@", "$", "%"]);
G("Strings", "normal", "Print every word in a typed sentence that has exactly {a} letters, one per line.", R(2, 12));
G("Strings", "normal", "Ask for a sentence and print it with every word longer than {a} letters in uppercase.", R(2, 10));
G("Strings", "hard", "Write a function that returns the {a} most common letters in a typed sentence, then print them.", R(1, 10));
G("Strings", "hard", "Write a function that returns the longest word in a typed sentence with more than {a} letters, or None if there is none, then print the result.", R(2, 12));

G("Lists", "easy", "Create a list of the numbers from 1 to {a} and print the sum of the list.", R(5, 50));
G("Lists", "easy", "Create a list of the numbers from {a} to {b} and print only the even ones.", R(1, 5), R(10, 30, 2));
G("Lists", "normal", "Write a function that returns how many numbers in a list are greater than {a}, then print the result for a list you make.", R(1, 60, 2));
G("Lists", "normal", "Ask for {a} numbers one at a time and print their average.", R(2, 12));
G("Lists", "normal", "Write a function that removes every number divisible by {a} from a list and returns the new list, then print it.", R(2, 15));
G("Lists", "normal", "Print the numbers from 1 to {a} in reverse order, {b} per line.", [10, 20, 30, 50], R(2, 5));
G("Lists", "hard", "Write a function that returns the {a}-th largest number in a list without sorting the list, then print the result.", R(2, 10));
G("Lists", "hard", "Write a function that returns a list with duplicates removed and the order kept, then print it for a list that repeats each number from 1 to {a} twice.", R(3, 25));
G("Lists", "hard", "Ask for {a} numbers one at a time, then print them from smallest to largest without using sort() or sorted().", R(3, 12));

G("Patterns", "easy", "Print a row of {a} stars.", R(3, 30));
G("Patterns", "easy", "Print a square of stars with {a} rows and {a} columns.", R(2, 15));
G("Patterns", "normal", "Print a triangle of stars with {a} rows.", R(3, 20));
G("Patterns", "normal", "Print a staircase of '{b}' characters with {a} steps.", R(3, 12), ["#", "*", "+", "@"]);
G("Patterns", "hard", "Print a centered pyramid of stars with {a} rows.", R(3, 15));
G("Patterns", "hard", "Print a diamond of stars with {a} rows in its top half.", R(2, 10));
G("Patterns", "hard", "Print a number triangle with {a} rows where row n holds the numbers 1 to n.", R(3, 15));

G("Mini games", "easy", "Make a coin flip game: ask the player for heads or tails, flip a coin {a} times at random, and print how many of the flips matched the guess.", R(1, 10));
G("Mini games", "easy", "Make a number guessing game: pick a random number from 1 to {a}, ask the player for one guess, and print if they were right.", R(5, 100, 5));
G("Mini games", "easy", "Ask the player for a number from 1 to {a}, then print a random number in that range and say if they match.", R(3, 30));
G("Mini games", "normal", "Make a number guessing game: pick a random number from 1 to {a}, let the player guess up to {b} times, and print higher or lower after each guess.", [10, 20, 50, 100, 200, 500], R(3, 10));
G("Mini games", "normal", "Make a dice game: roll two dice {a} times and print the total of each roll and the highest total.", R(2, 20));
G("Mini games", "hard", "Make rock paper scissors played best of {a} rounds: ask the player for each choice, pick the computer's choice at random, and print who wins overall.", R(3, 15, 2));
G("Mini games", "hard", "Make a hangman style game with a list of {a} words: pick one at random, ask the player for letters, and print the word with blanks after each guess.", R(3, 12));
G("Mini games", "hard", "Make a quiz game with {a} questions in a list. Ask each question, count the correct answers, and print the final score.", R(3, 15));
G("Mini games", "hard", "Make a bet game: the player starts with {a} coins, you ask for a bet each round, win or lose at random, and stop when they run out of coins.", R(50, 500, 50));


/* Strict check that the submission looks like a working Python solution.
   Returns "" when it passes, or the reason it failed. */
function validate_(code, task) {
  var KW = " if elif else for while def class in is not and or return import from as with lambda try except finally raise assert del global nonlocal yield pass break continue ";
  var STR = /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/g;
  var s = code.replace(/("""|''')[\s\S]*?\1/g, '""');
  var rows = s.split("\n"), logical = [], depth = 0, all = "";
  for (var i = 0; i < rows.length; i++) {
    var raw = rows[i].replace(/\s+$/, "");
    var line = "", q = "", cont = depth > 0;
    for (var j = 0; j < raw.length; j++) {
      var ch = raw[j];
      if (q) { line += ch; if (ch === "\\") { j++; line += raw[j] || ""; } else if (ch === q) { q = ""; } continue; }
      if (ch === "#") break;
      if (ch === '"' || ch === "'") { q = ch; line += ch; continue; }
      if ("([{".indexOf(ch) > -1) depth++;
      if (")]}".indexOf(ch) > -1) { depth--; if (depth < 0) return "Brackets do not match."; }
      line += ch;
    }
    if (q) return "A string is not closed on line " + (i + 1) + ".";
    if (line.trim() === "") continue;
    all += line + "\n";
    if (!cont) logical.push({ n: i + 1, indent: raw.match(/^\s*/)[0], text: line.trim() });
  }
  if (depth !== 0) return "Brackets do not match.";
  if (!logical.length) return "No code found.";
  var stack = [0], prevColon = false;
  for (var k = 0; k < logical.length; k++) {
    var L = logical[k], n = L.indent.length, t = L.text;
    if (/\t/.test(L.indent) && / /.test(L.indent)) return "Line " + L.n + " mixes tabs and spaces.";
    if (prevColon) {
      if (n <= stack[stack.length - 1]) return "Line " + L.n + " needs an indented block.";
      stack.push(n);
    } else {
      if (n > stack[stack.length - 1]) return "Unexpected indent on line " + L.n + ".";
      while (stack[stack.length - 1] > n) stack.pop();
      if (stack[stack.length - 1] !== n) return "Indent on line " + L.n + " does not match.";
    }
    var plain = t.replace(STR, '""');
    var first = (plain.match(/^[A-Za-z_]\w*/) || [""])[0];
    var isKw = /^(if|elif|else|for|while|def|class|try|except|finally|with)$/.test(first);
    if (isKw && plain.indexOf(":") < 0) return "Line " + L.n + " is missing a colon.";
    var ok = isKw
      || /^(return|import|from|raise|assert|del|global|nonlocal|yield|lambda)\b/.test(plain)
      || /^(pass|break|continue)$/.test(plain)
      || /^[A-Za-z_][\w.]*(\[[^\]]*\])?(\s*,\s*[A-Za-z_][\w.]*)*\s*([+\-*\/%]|\/\/|\*\*)?=(?!=)/.test(plain)
      || /^[A-Za-z_][\w.]*(\[.*\])?\(.*\)$/.test(plain);
    if (!ok) return "Line " + L.n + " is not valid Python.";
    var pairs = plain.match(/[A-Za-z_]\w*\s+[A-Za-z_]\w*/g) || [];
    for (var m = 0; m < pairs.length; m++) {
      var w = pairs[m].split(/\s+/);
      if (KW.indexOf(" " + w[0] + " ") < 0 && KW.indexOf(" " + w[1] + " ") < 0) return "Line " + L.n + " is not valid Python.";
    }
    prevColon = /:\s*$/.test(plain);
  }
  if (prevColon) return "The last block is empty.";
  var low = all.replace(STR, '""');
  if (!/\bprint\s*\(|\breturn\b/.test(low)) return "The code gives no output. Use print() or return.";
  if (/typed|\bask/i.test(task.t) && !/\binput\s*\(/.test(low)) return "This task needs input().";
  if (/Write a function/i.test(task.t) && !/\bdef\s+\w+\s*\(/.test(low)) return "This task needs a function (def).";
  return "";
}


/* Does one logical line look like Python? */
function pyLine_(plain) {
  var first = (plain.match(/^[A-Za-z_]\w*/) || [""])[0];
  if (/^(if|elif|else|for|while|def|class|try|except|finally|with)$/.test(first)) return true;
  if (/^(return|import|from|raise|assert|del|global|nonlocal|yield|lambda)\b/.test(plain)) return true;
  if (/^(pass|break|continue)$/.test(plain)) return true;
  if (/^[A-Za-z_][\w.]*(\[[^\]]*\])?(\s*,\s*[A-Za-z_][\w.]*)*\s*([+\-*\/%]|\/\/|\*\*)?=(?!=)/.test(plain)) return true;
  if (/^[A-Za-z_][\w.]*(\[.*\])?\(.*\)$/.test(plain)) return true;
  return false;
}

/* Reviewer: 10 points = structure 3 + task requirements 4 + style 3.
   Half-finished code still earns points. Random text or non-Python scores 0. */
function analyze_(code, task) {
  var KW = " if elif else for while def class in is not and or return import from as with lambda try except finally raise assert del global nonlocal yield pass break continue ";
  var STR = /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/g;
  var rows = code.split("\n"), lines = [], bad = [], good = 0, depth = 0, i, k;
  for (i = 0; i < rows.length; i++) {
    var plain = rows[i].replace(STR, '""').replace(/#.*$/, "").trim();
    if (plain === "") continue;
    var cont = depth > 0;
    for (k = 0; k < plain.length; k++) {
      if ("([{".indexOf(plain[k]) > -1) depth++;
      if (")]}".indexOf(plain[k]) > -1) depth--;
    }
    lines.push({ n: i + 1, plain: plain });
    if (cont) { good++; continue; }
    var first = (plain.match(/^[A-Za-z_]\w*/) || [""])[0];
    var isKw = /^(if|elif|else|for|while|def|class|try|except|finally|with)$/.test(first);
    var msg = "";
    if (/^print\b(?!\s*\()/.test(plain)) msg = "print needs parentheses, like print(...)";
    else if (isKw && plain.indexOf(":") < 0) msg = "this line needs a colon at the end";
    else if (/^(if|elif|while)\s+[A-Za-z_][\w.\[\]]*\s*=(?!=)/.test(plain)) msg = "use == to compare, a single = assigns a value";
    else if (!pyLine_(plain)) msg = "this line is not valid Python";
    else {
      var pairs = plain.match(/[A-Za-z_]\w*\s+[A-Za-z_]\w*/g) || [];
      for (k = 0; k < pairs.length; k++) {
        var w = pairs[k].split(/\s+/);
        if (KW.indexOf(" " + w[0] + " ") < 0 && KW.indexOf(" " + w[1] + " ") < 0) { msg = "this looks like plain English, not Python"; break; }
      }
    }
    if (msg) bad.push({ n: i + 1, text: msg + " (" + rows[i].trim().slice(0, 40) + ")" }); else good++;
  }
  if (!lines.length) return { total: 0, zero: "No code found.", groups: [] };
  var ratio = good / (good + bad.length);
  var badItems = bad.slice(0, 6).map(function (b) { return { ok: false, where: "Line " + b.n, text: b.text }; });
  if (ratio < 0.4) {
    return { total: 0, zero: "Most lines are not Python code.", groups: [{ title: "Structure", got: 0, max: 3, items: badItems }] };
  }

  /* structure (3) */
  var err = validate_(code, task);
  var reqErr = /gives no output|needs input|needs a function/.test(err);
  var structErr = (err && !reqErr) ? err : "";
  var sItems = [{ ok: bad.length === 0, where: "Code", text: good + " of " + (good + bad.length) + " lines look like valid Python" }].concat(badItems);
  if (structErr && !/not valid Python|missing a colon/.test(structErr)) {
    var ln = structErr.match(/line (\d+)/i);
    sItems.push({ ok: false, where: ln ? "Line " + ln[1] : "Code", text: structErr });
  }
  var sPts = (bad.length || structErr) ? Math.min(2, Math.round(ratio * 3)) : 3;

  /* task requirements (4) */
  var plainAll = lines.map(function (l) { return l.plain; }).join("\n");
  function where(re) {
    for (var j = 0; j < lines.length; j++) { if (re.test(lines[j].plain)) return "Line " + lines[j].n; }
    return "";
  }
  var checks = [];
  function add(re, okT, badT) { var w = where(re); checks.push({ ok: !!w, where: w || "Missing", text: w ? okT : badT }); }
  var T = task.t;
  add(/\bprint\s*\(|\breturn\b/, "shows the answer", "nothing is printed or returned, so the program shows no answer");
  if (/typed|\bask/i.test(T)) add(/\binput\s*\(/, "reads input from the player", "the task needs input() to read from the player");
  if (/Write a function/i.test(T)) {
    add(/\bdef\s+\w+\s*\(/, "defines a function", "the task needs a function written with def");
    var fm = plainAll.match(/\bdef\s+(\w+)/);
    if (fm) {
      var calls = plainAll.match(new RegExp("\\b" + fm[1] + "\\s*\\(", "g")) || [];
      checks.push({ ok: calls.length > 1, where: calls.length > 1 ? "Code" : "Missing", text: calls.length > 1 ? "calls the function" : "the function is defined but never called" });
    }
  }
  if (/prime|divisible|multiples|even|digits add up|remove every/i.test(T)) add(/%/, "uses % to test divisibility", "this task needs the % operator");
  if (/prime|Fibonacci|factorial|multiples|every|all numbers|up to|triangle|square|staircase|pyramid|diamond|rows|steps|times|rounds|questions|per line|reverse order|one at a time/i.test(T)) add(/\bfor\b|\bwhile\b|\brange\s*\(/, "uses a loop", "this task needs a loop (for or while)");
  if (/Fibonacci/i.test(T)) add(/\+/, "adds numbers to build the sequence", "Fibonacci needs the previous two numbers added together");
  if (/factorial/i.test(T)) add(/\*/, "multiplies to build the factorial", "a factorial needs multiplication");
  if (/average/i.test(T)) add(/\/|\bsum\s*\(/, "divides the total to get an average", "an average needs a total divided by the count");
  if (/reverse order/i.test(T)) add(/\[::-1\]|reversed|range\([^)]*-1\s*\)/, "counts backwards", "counting down needs reversed(), [::-1] or a negative step");
  if (/uppercase/i.test(T)) add(/\.upper\s*\(/, "uses .upper()", "this task needs .upper()");
  if (/random/i.test(T)) add(/\brandom\b/, "uses the random module", "this task needs the random module (import random)");
  if (/\bstars?\b/i.test(T)) add(/\*/, "builds the stars with *", "this task needs the * character");
  if (/guess|game|rounds|quiz|bet|dice|flip/i.test(T)) add(/\bif\b|\bwhile\b/, "decides the result with if or while", "a game needs if checks to decide the result");
  var passed = checks.filter(function (c) { return c.ok; }).length;
  var rPts = Math.round(4 * passed / checks.length);
  if (passed > 0 && rPts === 0) rPts = 1;

  /* style (3) */
  var cLine = "", longLine = "";
  for (i = 0; i < rows.length; i++) {
    if (!cLine && /#/.test(rows[i].replace(STR, '""'))) cLine = "Line " + (i + 1);
    if (!longLine && rows[i].length > 79) longLine = "Line " + (i + 1);
  }
  var names = plainAll.match(/^[A-Za-z_]\w*(?=\s*=(?!=))/gm) || [];
  var shortNames = names.filter(function (n) { return n.length < 2; });
  var stItems = [
    { ok: !!cLine, where: cLine || "Missing", text: cLine ? "has a comment that explains the idea" : "add a short # comment that explains the idea" },
    { ok: shortNames.length === 0, where: shortNames.length ? "Variables" : "Code", text: shortNames.length ? "the name '" + shortNames[0] + "' is hard to read, use a word" : "variable names are readable" },
    { ok: !longLine, where: longLine || "Code", text: longLine ? "this line is longer than 79 characters" : "lines are a tidy length" }
  ];
  var stPts = stItems.filter(function (c) { return c.ok; }).length;

  var total = Math.max(1, Math.min(10, sPts + rPts + stPts));
  return { total: total, zero: "", groups: [
    { title: "Structure", got: sPts, max: 3, items: sItems },
    { title: "Task requirements", got: rPts, max: 4, items: checks },
    { title: "Style", got: stPts, max: 3, items: stItems }
  ] };
}


  var api = { CATS: CATS, TASKS: TASKS, analyze: analyze_, validate: validate_ };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Shared = api;
})(typeof window !== "undefined" ? window : this);
