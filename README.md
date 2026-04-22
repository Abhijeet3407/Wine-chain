# Wine Chain — Blockchain Wine Inventory System

A full-stack blockchain-based wine inventory and marketplace platform with user authentication, two-factor login, per-user ownership tracking, a peer-to-peer marketplace, and Stripe-powered payments — blockchain ownership only transfers after payment is confirmed.

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
- **Stripe payments** — Card payments collected via Stripe Elements; blockchain ownership transfer only happens after payment is confirmed via webhook
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
| Payments     | Stripe (PaymentIntents + Webhooks)              |
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
│   │   ├── Listing.js            Marketplace listing schema (includes AwaitingPayment status)
│   │   ├── Offer.js              Offer schema (includes AwaitingPayment status + stripePaymentIntentId)
│   │   └── User.js               User schema (JWT, 2FA, device trust)
│   ├── routes/
│   │   ├── auth.js               Signup, login, 2FA verify, profile, logout
│   │   ├── bottles.js            Bottle CRUD + verify (auth-protected)
│   │   ├── chain.js              Ledger endpoints
│   │   ├── marketplace.js        Listings, offers, buy-now, Stripe webhook, payment details
│   │   └── stats.js              Per-user dashboard stats + analytics
│   ├── mailer.js                 Resend email helpers (2FA, welcome, marketplace, payment request)
│   ├── .env                      Environment variables (not committed)
│   ├── server.js                 Express entry point (raw body middleware for Stripe webhook)
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
│   │   │   ├── Marketplace.jsx   Buy, sell, offers
│   │   │   └── Payment.jsx       Stripe card payment page (no login required)
│   │   ├── utils/
│   │   │   └── api.js            Axios instance + all API calls
│   │   ├── styles/
│   │   │   └── App.css           Global styles + mobile responsive
│   │   ├── App.jsx               Routing, nav, auth state (detects ?pi= for payment page)
│   │   └── index.js              React entry point
│   ├── vercel.json               Rewrites /api/* → Render backend
│   └── package.json
├── package.json                  Root scripts (install:all, dev)
├── .gitignore
└── README.md
```

---

## Payment Flow

Blockchain ownership only transfers **after payment is received**, not at the point of offer acceptance.

```
Seller accepts offer / confirms buy-now
        ↓
Stripe PaymentIntent created (GBP)
Listing status → AwaitingPayment (blocks new offers)
Buyer receives "Pay Now" email with unique payment link
        ↓
Buyer visits /?pi=<paymentIntentId>
Stripe card form collects payment (no account needed)
        ↓
Stripe webhook fires → payment_intent.succeeded
Blockchain block mined → ownership transferred on-chain
Confirmation emails sent to buyer and seller
```

**Offer statuses:** `Pending` → `AwaitingPayment` → `Accepted` (or `Rejected`)

**Listing statuses:** `Active` → `Pending` → `AwaitingPayment` → `Sold` (or `Unlisted`)

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

| Method | Endpoint                              | Auth        | Description                                                      |
|--------|---------------------------------------|-------------|------------------------------------------------------------------|
| POST   | /webhook                              | Stripe sig  | Stripe webhook — confirms payment and triggers blockchain update |
| GET    | /payment/:paymentIntentId             | No          | Get payment details (client secret) for the payment page        |
| GET    | /                                     | No          | List Active / Pending / AwaitingPayment listings                 |
| POST   | /                                     | JWT         | Create a new listing                                             |
| DELETE | /:id                                  | JWT         | Unlist a bottle (seller only)                                    |
| POST   | /:id/buy                              | No          | Buyer submits a buy-now request; notifies seller                 |
| POST   | /:id/buy/confirm                      | JWT         | Seller confirms; creates Stripe PaymentIntent, emails buyer      |
| POST   | /:id/offers                           | No          | Make an offer; notifies seller                                   |
| GET    | /:id/offers                           | JWT         | Get all offers for a listing (seller only)                       |
| POST   | /:id/offers/:offerId/accept           | JWT         | Seller accepts offer; creates Stripe PaymentIntent, emails buyer |
| POST   | /:id/offers/:offerId/reject           | JWT         | Reject an offer; notifies buyer                                  |

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

# Stripe (https://stripe.com)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Frontend URL (used in payment emails)
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (`frontend/.env`)

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
```

> For production email delivery to any address, add and verify a custom domain in the Resend dashboard and update `RESEND_FROM_EMAIL` accordingly.

---

## Local Development

### Prerequisites

- Node.js v18+
- A MongoDB Atlas free cluster (or local MongoDB)
- Resend account + API key
- Cloudinary account
- Stripe account (test keys are fine for local dev)
- Stripe CLI (to forward webhooks locally)

### Install dependencies

```bash
npm run install:all
```

### Configure environment

Create `backend/.env` from the template above using Stripe **test** keys (`sk_test_...`, `whsec_...`).

Create `frontend/.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

### Forward Stripe webhooks locally

```bash
stripe listen --forward-to localhost:5000/api/marketplace/webhook
```

Copy the `whsec_...` secret it prints and set it as `STRIPE_WEBHOOK_SECRET` in `backend/.env`.

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

**Stripe webhook in production:** Register `https://your-render-api.onrender.com/api/marketplace/webhook` in the Stripe dashboard under Webhooks, listening for the `payment_intent.succeeded` event. Copy the generated `whsec_...` signing secret into Render's environment variables.

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
