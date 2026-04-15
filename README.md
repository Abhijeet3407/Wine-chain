# Wine Chain — Blockchain Wine Inventory System

A full-stack blockchain-based wine inventory and marketplace platform with user authentication, two-factor login, per-user ownership tracking, and a peer-to-peer marketplace.

---

## Features

- **User accounts** — Sign up, log in with 2FA OTP via email (Resend), profile management
- **Device trust** — Skip OTP for 2 hours after first login from same device
- **Register bottles** — Add wine bottles to an immutable SHA-256 blockchain ledger
- **Per-user inventory** — Each user sees only bottles they registered
- **Verify authenticity** — Confirm any bottle's full provenance and blockchain history
- **Blockchain ledger** — Browse every block ever written to the chain
- **Dashboard** — Portfolio stats with per-user filtering and chain validity indicator
- **Marketplace** — List bottles for sale, make offers, buy now, accept/reject offers
- **Image uploads** — Cloudinary-backed bottle photo storage
- **Mobile responsive** — Bottom tab navigation on small screens

---

## Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| Frontend     | React 18, Axios, React-Toastify                 |
| Backend      | Node.js 18, Express 4                           |
| Database     | MongoDB Atlas (Mongoose ODM)                    |
| Blockchain   | SHA-256 Proof-of-Work (custom, difficulty 2)    |
| Auth         | JWT (jsonwebtoken), bcrypt                      |
| 2FA / Email  | Resend API (transactional email)                |
| Image Upload | Cloudinary + multer-storage-cloudinary          |
| Deployment   | Vercel (frontend) + Render (backend)            |

---

## Project Structure

```
wine-chain/
├── backend/
│   ├── blockchain/
│   │   └── chain.js              SHA-256 PoW blockchain engine
│   ├── middleware/
│   │   └── authMiddleware.js     JWT protect middleware
│   ├── models/
│   │   ├── Block.js              MongoDB Block schema
│   │   ├── Bottle.js             Bottle schema (registeredBy, ownerEmail)
│   │   ├── Listing.js            Marketplace listing schema
│   │   └── User.js               User schema (JWT, 2FA, device trust)
│   ├── routes/
│   │   ├── auth.js               Signup, login, 2FA verify, profile, logout
│   │   ├── bottles.js            Bottle CRUD + verify (auth-protected)
│   │   ├── chain.js              Ledger endpoints
│   │   ├── marketplace.js        Listings, offers, buy-now, accept/reject
│   │   └── stats.js              Per-user dashboard stats + analytics
│   ├── mailer.js                 Resend email helpers (2FA, welcome, marketplace)
│   ├── .env                      Environment variables (not committed)
│   ├── server.js                 Express entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx          Landing / marketing page
│   │   │   ├── Login.jsx         Login form with device trust + cold-start retry
│   │   │   ├── Signup.jsx        Registration form
│   │   │   ├── Verify2FA.jsx     OTP entry + fallback code display
│   │   │   ├── Profile.jsx       View and edit personal info / password
│   │   │   ├── Dashboard.jsx     Stats overview
│   │   │   ├── Inventory.jsx     Per-user bottle list + PDF export
│   │   │   ├── AddBottle.jsx     Register a new bottle
│   │   │   ├── Verify.jsx        Verify bottle authenticity
│   │   │   ├── Ledger.jsx        Full blockchain ledger
│   │   │   └── Marketplace.jsx   Buy, sell, offers
│   │   ├── utils/
│   │   │   └── api.js            Axios instance + all API calls
│   │   ├── styles/
│   │   │   └── App.css           Global styles + mobile responsive
│   │   ├── App.jsx               Routing, nav, auth state
│   │   └── index.js              React entry point
│   ├── vercel.json               Rewrites /api/* → Render backend
│   └── package.json
├── package.json                  Root scripts (install:all, dev)
├── .gitignore
└── README.md
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint                  | Auth | Description                                 |
|--------|---------------------------|------|---------------------------------------------|
| POST   | /signup                   | No   | Create account (name, email, password)      |
| POST   | /login                    | No   | Login; triggers 2FA OTP or device trust     |
| POST   | /verify-2fa               | No   | Submit OTP; returns JWT + device token      |
| GET    | /me                       | JWT  | Get current user                            |
| PUT    | /profile                  | JWT  | Update name, email, or password             |
| POST   | /logout                   | No   | Stateless logout (client clears token)      |

### Bottles — `/api/bottles`

| Method | Endpoint                  | Auth | Description                                 |
|--------|---------------------------|------|---------------------------------------------|
| GET    | /                         | JWT  | List bottles owned by user (+ legacy)       |
| POST   | /                         | JWT  | Register new bottle (owner set from JWT)    |
| GET    | /:id                      | JWT  | Get single bottle                           |
| GET    | /:id/verify               | JWT  | Verify authenticity via blockchain          |
| DELETE | /:id                      | JWT  | Delete bottle (owner only)                  |

### Blockchain — `/api/chain`

| Method | Endpoint                  | Auth | Description                                 |
|--------|---------------------------|------|---------------------------------------------|
| GET    | /                         | JWT  | Get full ledger (paginated)                 |
| GET    | /validate                 | JWT  | Validate chain integrity                    |
| GET    | /:hash                    | JWT  | Get single block by hash                    |

### Stats — `/api/stats`

| Method | Endpoint                  | Auth | Description                                 |
|--------|---------------------------|------|---------------------------------------------|
| GET    | /                         | JWT  | Per-user summary stats                      |
| GET    | /analytics                | JWT  | Per-user analytics breakdown                |

### Marketplace — `/api/marketplace`

| Method | Endpoint                              | Auth | Description                           |
|--------|---------------------------------------|------|---------------------------------------|
| GET    | /                                     | JWT  | List active marketplace listings      |
| POST   | /                                     | JWT  | Create a new listing                  |
| DELETE | /:id                                  | JWT  | Unlist a bottle (seller only)         |
| POST   | /:id/buy                              | JWT  | Initiate a buy-now purchase           |
| POST   | /:id/buy/confirm                      | JWT  | Confirm buy-now (seller confirms)     |
| POST   | /:id/offers                           | JWT  | Make an offer                         |
| GET    | /:id/offers                           | JWT  | Get all offers for a listing          |
| POST   | /:id/offers/:offerId/accept           | JWT  | Accept an offer                       |
| POST   | /:id/offers/:offerId/reject           | JWT  | Reject an offer                       |

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/winechain
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
NODE_ENV=production

# Resend (https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=Wine Chain <onboarding@resend.dev>

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> For production email delivery to any address (not just your own Resend-verified domain), add and verify a custom domain in the Resend dashboard and update `RESEND_FROM_EMAIL` accordingly.

---

## Local Development

### Prerequisites

- Node.js v18+
- A MongoDB Atlas free cluster (or local MongoDB)
- Resend account + API key
- Cloudinary account

### Install dependencies

```bash
npm run install:all
```

### Configure environment

Create `backend/.env` from the template above.

For local frontend development, create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

The Vite/CRA dev proxy is already set up in `package.json` to forward `/api` requests to `localhost:5000`.

### Run

```bash
# Both servers via concurrently
npm run dev

# Or separately
cd backend && npm run dev   # http://localhost:5000
cd frontend && npm start    # http://localhost:3000
```

---

## Deployment

The project is deployed in a split-host configuration:

| Service | What runs there     | URL                                      |
|---------|---------------------|------------------------------------------|
| Vercel  | React frontend      | Configured via `frontend/vercel.json`    |
| Render  | Node/Express API    | Free tier (cold-start ~30s after idle)   |

`frontend/vercel.json` rewrites all `/api/*` requests to the Render backend URL so there are no CORS issues.

The login page includes automatic retry logic (up to 7 attempts, 10s apart) to handle Render's free-tier cold start gracefully.

---

## Authentication Flow

```
User enters email + password
        │
        ▼
Backend checks device trust token (2-hour window)
        │
   ┌────┴────┐
   │ Trusted │ ──► Skip OTP → JWT issued → logged in
   │ device  │
   └────┬────┘
        │ Not trusted
        ▼
Resend sends 6-digit OTP to user's email
        │
        ▼ (if email fails, code shown on screen)
User enters OTP on Verify screen
        │
        ▼
JWT issued + device trust token stored (2h)
```

Device trust tokens are stored in `localStorage` as `winechain_device` and survive logout, enabling seamless re-login within the trust window.

---

## Recommended VS Code Extensions

- **Prettier** (`esbenp.prettier-vscode`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **MongoDB for VS Code** (`mongodb.mongodb-vscode`)
- **ES7+ React Snippets** (`dsznajder.es7-react-js-snippets`)
