# Job Application Tracker

Spec: `PROJECT.md` (the user supplies it; it is not in this repo). It wins over this file. Its "Out of scope" list is binding: no resume upload, email reminders, calendar sync, team accounts, dark mode, password reset, OAuth.

## Layout

Two independent apps, each with its own `package.json`. No monorepo tooling.

- `server/` Express 4 + Mongoose, ES modules. `src/{config,models,middleware,controllers,routes,utils}`. `app.js` builds the app, `index.js` connects the DB and listens.
- `client/` Vite + React 19, React Router 7, Tailwind v4, Axios. `src/{api,context,components,pages}`, plus `constants.js`.

## Run

- MongoDB runs locally as the `MongoDB` Windows service (`mongodb://127.0.0.1:27017/job-tracker`). Prod uses Atlas.
- `server/`: copy `.env.example` to `.env`, then `npm run dev` (nodemon, port 5000).
- `client/`: `.env` has `VITE_API_URL`, then `npm run dev` (port 5173).
- `client/`: `npm run lint` and `npm run build` must pass before you call work done.
- There is no test framework in the repo. Verify with throwaway scripts outside the repo (scratchpad). Install test tools with `npm i --no-save`, then `npm prune`. Never leave test files or test deps behind.

## Deploy

- API on Render via root `render.yaml` (`rootDir: server`); frontend on Vercel (root dir `client`, SPA rewrite in `client/vercel.json`).
- The server refuses to start without `MONGO_URI`, `JWT_SECRET` or `CLIENT_URL`. Never let CORS fall back to a wildcard: `cors({ origin: undefined })` allows every origin.
- `VITE_API_URL` is baked in at build time, so changing it needs a Vercel redeploy. It must be the HTTPS API URL ending in `/api`.
- Never guess the user's URLs. Use placeholders.

## Rules you must not break

1. **User-scoped queries.** Every Application query filters by `req.user.id`. Never read the owner from the request body, params or query. Someone else's id returns 404, never 403. Aggregations need `new mongoose.Types.ObjectId(req.user.id)`.
2. **No secrets in code.** Config comes from env vars only. `.env` stays gitignored; keep `.env.example` in sync when adding a var. Never print secrets or connection strings with passwords.
3. **No new dependencies without asking**, server or client. Say what and why, then wait. (Already added with approval: `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`.)
4. **Stay plain**: no Redux, no TypeScript, no component library, no Docker.
5. Never return the password or a stack trace. All errors are `{ message }` with a correct status.
6. Confirm before anything outward-facing or hard to undo (deploys, pushes, deleting data, installing system software).

## Server conventions

- Validate on the server. Whitelist body fields (`pickApplicationFields`) so `user` and `_id` are never mass-assigned. Check types, because `{ "$gt": "" }` must not reach a query.
- Wrap async handlers in `asyncHandler` (Express 4 drops rejected promises). Errors go to the central handler in `middleware/error.js`.
- Escape user text before building a RegExp. Treat malformed ObjectIds as 404.
- Register `/stats` before `/:id`.
- Response shapes the client depends on: `{ token, user }`, `{ application }`, `{ applications }`, stats object, `{ message }`.
- Login errors are always the same generic message, with constant-time compare.

## Client conventions

- Talk to the API only through `src/api/axios.js` (token interceptor; a 401 on a request that carried a token logs out). Use `getErrorMessage` for error text.
- Auth lives in `AuthContext`; protected pages sit under `ProtectedRoute`.
- Filtering and search are sent to the server as query params. Never filter the fetched list in the browser.
- Status changes are optimistic with rollback. Create, edit and delete update local state; no full refetch. Refresh the stats after any mutation.
- Dates are stored as UTC midnight: format with `timeZone: 'UTC'` and send `YYYY-MM-DD`.
- Status names, labels and colours live in `src/constants.js`. Write Tailwind class names out in full, never build them dynamically.
- Styling: use the shared `.input`, `.btn-primary`, `.btn-secondary` and `.btn-danger` classes from `index.css`. Tailwind v4 gradient syntax is `bg-linear-to-*`.
- Every list or screen needs loading, empty and error states.

## Working here

- Windows + Git Bash. Heredocs containing quotes and backticks break the shell tool, so use the Write/Edit tools for file content.
- Edit `package.json` through `npm install`, not by hand.
