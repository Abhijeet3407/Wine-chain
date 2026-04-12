# 🍷 Wine Chain — Blockchain Wine Inventory System

A full-stack blockchain-based wine inventory system built with **React**, **Node.js/Express**, and **MongoDB**.

---

## Features

- **Register bottles** — Add wine bottles to an immutable blockchain ledger
- **Transfer ownership** — Record ownership changes as blockchain transactions
- **Verify authenticity** — Confirm any bottle's full provenance history
- **Blockchain ledger** — Browse every block ever written to the chain
- **Dashboard** — Portfolio stats, chain validity indicator

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Axios, React-Toastify   |
| Backend    | Node.js, Express 4                |
| Database   | MongoDB (Mongoose ODM)            |
| Blockchain | SHA-256 Proof-of-Work (built-in)  |

---

## Prerequisites

Install these before running the project:

1. **Node.js** (v18+) → https://nodejs.org
2. **MongoDB Community** → https://www.mongodb.com/try/download/community
   - After installing, start MongoDB:
     - **Windows**: MongoDB runs as a service automatically
     - **Mac**: `brew services start mongodb-community`
     - **Linux**: `sudo systemctl start mongod`

---

## Setup & Run in VS Code

### Step 1 — Open the project
```
File → Open Folder → select the wine-chain folder
```

### Step 2 — Install dependencies
Open the integrated terminal (`Ctrl+`` `) and run:
```bash
npm run install:all
```

### Step 3 — Configure environment
The `backend/.env` file is already created with defaults:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/winechain
NODE_ENV=development
```
Change `MONGODB_URI` if your MongoDB runs on a different port or you use MongoDB Atlas.

### Step 4 — Run the full stack
**Option A — Using VS Code Tasks (recommended):**
```
Terminal → Run Task → Start Full Stack
```

**Option B — Using the terminal:**
```bash
npm run dev
```
This starts both servers via `concurrently`.

**Option C — Run separately:**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

### Step 5 — Open the app
Visit **http://localhost:3000** in your browser.

The API runs on **http://localhost:5000**.

---

## API Endpoints

| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | /api/bottles                  | List all bottles         |
| POST   | /api/bottles                  | Register new bottle      |
| GET    | /api/bottles/:id              | Get single bottle        |
| PUT    | /api/bottles/:id/transfer     | Transfer ownership       |
| GET    | /api/bottles/:id/verify       | Verify authenticity      |
| DELETE | /api/bottles/:id              | Remove bottle            |
| GET    | /api/chain                    | Get blockchain ledger    |
| GET    | /api/chain/validate           | Validate chain integrity |
| GET    | /api/stats                    | Dashboard statistics     |

---

## Project Structure

```
wine-chain/
├── .vscode/
│   ├── launch.json        ← Debug configuration
│   └── tasks.json         ← Build tasks
├── backend/
│   ├── blockchain/
│   │   └── chain.js       ← SHA-256 PoW blockchain engine
│   ├── models/
│   │   ├── Block.js       ← MongoDB Block schema
│   │   └── Bottle.js      ← MongoDB Bottle schema
│   ├── routes/
│   │   ├── bottles.js     ← Bottle CRUD + transfer + verify
│   │   ├── chain.js       ← Ledger endpoints
│   │   └── stats.js       ← Dashboard stats
│   ├── .env               ← Environment variables
│   ├── package.json
│   └── server.js          ← Express entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── AddBottle.jsx
│   │   │   ├── Transfer.jsx
│   │   │   ├── Verify.jsx
│   │   │   └── Ledger.jsx
│   │   ├── utils/
│   │   │   └── api.js     ← Axios API calls
│   │   ├── styles/
│   │   │   └── App.css    ← Global styles
│   │   ├── App.jsx        ← Main app with sidebar navigation
│   │   └── index.js       ← React entry point
│   └── package.json
├── package.json           ← Root scripts (install:all, dev)
├── .gitignore
└── README.md
```

---

## Using MongoDB Atlas (Cloud)

If you prefer a cloud database instead of local MongoDB:

1. Create a free account at https://cloud.mongodb.com
2. Create a free M0 cluster
3. Get your connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/winechain`)
4. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/winechain
```

---

## Recommended VS Code Extensions

Install these for the best experience:
- **Prettier** (`esbenp.prettier-vscode`) — code formatting
- **ESLint** (`dbaeumer.vscode-eslint`) — linting
- **MongoDB for VS Code** (`mongodb.mongodb-vscode`) — browse your database
- **ES7+ React Snippets** (`dsznajder.es7-react-js-snippets`) — React shortcuts
