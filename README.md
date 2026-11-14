# AKASCD (Simple Code Duel)

Python coding duels with accounts, friends, rooms and a code reviewer.
No packages to install. It only needs Node 18 or newer.

## Run it on your computer

1. Open this folder in VS Code.
2. Open a terminal and run: `node server.js`
3. Open http://localhost:3000 in Chrome (do not open the HTML file directly).

To test Multiplayer, use two browsers (or one normal and one private window) with two accounts.

## Put it online 24/7 so friends anywhere can play

Your own computer only runs the game while the terminal is open. For a site that is always on, it has to run on a host. Render is one option.

1. Upload this folder to a new GitHub repository. `server.js`, `shared.js` and `package.json` sit at the top, and `index.html` sits inside a folder named `public` (lowercase).
2. On render.com choose New > Web Service and connect the repository.
3. Settings: Build command `npm install`, Start command `node server.js`.
4. Choose a **paid** instance type, not Free. Free services go to sleep after 15 minutes without visitors and can't keep files, so accounts would be lost.
5. Under Advanced, add a **Disk** (1 GB is plenty) with mount path `/var/data`.
6. Add an environment variable: `DATA_DIR` = `/var/data`. This is where `data.json` (accounts, points, friends) is saved, and a disk keeps it across restarts and updates.
7. Deploy. Render gives you a link like `https://your-name.onrender.com`. It works from any computer in the world over HTTPS.
8. Optional: in the service settings, add your own domain name under Custom Domains.

Check Render's pricing page for the current price of a paid instance and a disk.

## Things to know

- Usernames are saved in lowercase. The password is an 8-digit number, typed twice when registering. Accounts from older versions can't log in, so delete `data.json` once to start fresh.
- Multiplayer: one player creates a room and gets a 4-digit code and a colour (red, blue, green or yellow). The friend joins with the code and the same colour. The host presses Start, and both players get the same task and time limit.
- Scoring (10 points): structure 3, task requirements 4, style 3. The server does the scoring, so players can't change their own score. Equal scores are a tie. Every point earned is added to the player's total points.
- The reviewer is rule-based, not a real AI. Real AI review would be a call to the Claude API from `server.js` with the key kept in an environment variable.
- Everything is saved in one file (`data.json`). For a large number of players, move to a real database later.
