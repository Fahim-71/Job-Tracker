# Job Application Tracker

A web app for logging every job application you send and tracking each one from applied to offer or rejection.

**Live demo:** https://YOUR-APP.vercel.app

The API runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up.

## Features

- Register and log in with email and password. Sessions use JWT.
- Add, edit and delete applications: company, role, status, date applied, job link, salary, location and notes.
- Four-column board (Applied, Interview, Offer, Rejected) with a count on each column.
- Move an application between columns from the status dropdown on its card. The card moves immediately and rolls back if the server rejects the change.
- Search by company or role, and filter by status. Both are handled by the server.
- Summary cards for total applications, interviews, offers and response rate (interviews plus offers, as a percentage of the total).
- Export the currently filtered applications to CSV.
- Every user sees only their own data.
- Loading skeletons, empty states and error messages on every screen. The layout adapts to phones, with the columns stacking.

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS v4, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt-compatible password hashing (bcryptjs) |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Screenshots

Replace these placeholders with real images in `docs/screenshots/`.

| Screen | File |
|---|---|
| Dashboard | `docs/screenshots/dashboard.png` |
| Add and edit modal | `docs/screenshots/modal.png` |
| Search and filter | `docs/screenshots/filter.png` |
| Mobile layout | `docs/screenshots/mobile.png` |

## Project structure

```
client/    Vite + React app
server/    Express API
render.yaml    Render blueprint for the API
```

The two halves have separate `package.json` files and are installed and run independently.

## Local setup

### Prerequisites

- Node.js 20.19 or newer
- MongoDB, either installed locally or a free MongoDB Atlas cluster

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` (see the table below), then start the API:

```bash
npm run dev
```

The API listens on http://localhost:5000. Check it at http://localhost:5000/api/health, which returns `{ "status": "ok" }`.

### 2. Client

In a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 and register an account.

## Environment variables

Real `.env` files are gitignored. Each half ships a `.env.example` to copy.

### server/.env

| Variable | Required | Description | Local example |
|---|---|---|---|
| `PORT` | No | Port the API listens on. Render sets this itself. | `5000` |
| `MONGO_URI` | Yes | MongoDB connection string. | `mongodb://127.0.0.1:27017/job-tracker` |
| `JWT_SECRET` | Yes | Long random string used to sign tokens. | Any long random value |
| `CLIENT_URL` | Yes | The single frontend origin allowed by CORS, with no trailing path. | `http://localhost:5173` |

The server refuses to start if `MONGO_URI`, `JWT_SECRET` or `CLIENT_URL` is missing.

To generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### client/.env

| Variable | Required | Description | Local example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Base URL of the API, ending in `/api`. | `http://localhost:5000/api` |

Vite reads this at build time. After changing it on a hosted deployment, redeploy the frontend.

## Scripts

| Where | Command | What it does |
|---|---|---|
| `server/` | `npm run dev` | Start the API with auto-reload (nodemon) |
| `server/` | `npm start` | Start the API normally |
| `client/` | `npm run dev` | Start the dev server |
| `client/` | `npm run build` | Production build into `client/dist` |
| `client/` | `npm run lint` | Lint the client code |

## Deployment

The API deploys to Render and the frontend to Vercel. The two URLs refer to each other, so set them up in this order:

1. **Render.** Create a Blueprint from this repo (it reads `render.yaml`). Set `MONGO_URI`, and set `CLIENT_URL` to a temporary value for now. In MongoDB Atlas, allow network access from `0.0.0.0/0`, because Render's free tier has no fixed IP.
2. **Vercel.** Import the repo, set the root directory to `client`, and set `VITE_API_URL` to `https://YOUR-API.onrender.com/api`.
3. **Render again.** Set `CLIENT_URL` to your Vercel URL, for example `https://YOUR-APP.vercel.app`, and let the service restart.

`client/vercel.json` rewrites every route to `index.html` so that refreshing a page such as `/dashboard` works.
