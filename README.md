# LeadDesk Mini

A small lead-capture app: a public inquiry form and a protected admin panel to manage submissions.

**Live app:** https://leaddesk-full-stack.vercel.app
**Admin panel:** https://leaddesk-full-stack.vercel.app/admin

## Stack

- **Frontend:** React + Vite + Tailwind CSS, deployed on Vercel
- **Backend:** Node.js + Express, deployed on Railway
- **Database:** Firebase Realtime Database
- **Auth:** JWT in an httpOnly cookie, passwords hashed with bcrypt

## Features

- Public landing page with a lead form (name, email, budget range, message)
- Client-side and server-side validation
- Admin panel at `/admin` — lists all leads, search by name/email, status toggle (New / Contacted / Closed)
- JWT-based admin authentication with login/logout
- Rate limiting on the public submit endpoint and the login endpoint

## Project structure

```
backend/
  config/firebase.js     Firebase Admin SDK init
  middleware/auth.js     JWT verification middleware
  routes/auth.js         login / logout / me
  routes/leads.js        create lead (public), list + update status (protected)
  scripts/seedAdmin.js   creates the initial admin user
  utils/validate.js      server-side lead validation
  server.js

frontend/
  src/pages/Home.jsx     public lead form
  src/pages/Admin.jsx    admin lead list
  src/pages/Login.jsx    admin login
  src/App.jsx            routes
```

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in Firebase + JWT values
npm run seed            # creates the admin user from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm run dev
```

## Environment variables

**Backend**

| Variable | Description |
|---|---|
| `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_CLIENT_ID`, `FIREBASE_DATABASE_URL` | Firebase Admin SDK service account credentials |
| `JWT_SECRET` | Secret used to sign admin session tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used once by `npm run seed` to create the admin account |
| `CLIENT_URL` | Exact origin of the deployed frontend, used for CORS (no trailing slash) |
| `NODE_ENV`, `PORT` | Runtime config |

**Frontend**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## Deployment notes

- Vercel project root is `frontend/`; `frontend/vercel.json` rewrites all routes to `index.html` so client-side routes (`/admin`, `/login`) work on direct load.
- `CLIENT_URL` on Railway must match the frontend origin **exactly**, with no trailing slash — the backend does an exact string match for CORS.
