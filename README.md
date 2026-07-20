# YogaFlow Backend

Express + TypeScript REST API for the YogaFlow e-commerce store, with MongoDB and [better-auth](https://better-auth.com) session authentication.

## Tech stack

- Node.js + Express 5 (TypeScript)
- MongoDB (Atlas)
- better-auth (email + password, session cookies, user roles)

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your values
npm run seed           # creates demo accounts + 12 products
npm run dev            # starts http://localhost:5000
```

### Environment variables (`.env`)

| Variable | Description |
| --- | --- |
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB` | Database name (e.g. `yoga-flow`) |
| `BETTER_AUTH_SECRET` | Secret used to sign sessions |
| `BETTER_AUTH_URL` | Public URL of this server |
| `CLIENT_ORIGIN` | Comma-separated allowed frontend origins |

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| User | `user@yogaflow.com` | `User@1234` |
| Admin | `admin@yogaflow.com` | `Admin@1234` |

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `ALL` | `/api/auth/*` | — | better-auth (sign-up, sign-in, sign-out, session) |
| `GET` | `/api/products` | Public | List with `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` |
| `GET` | `/api/products/:id` | Public | Product details + related items |
| `POST` | `/api/products` | Logged in | Add a product (validated) |
| `DELETE` | `/api/products/:id` | Owner/Admin | Delete a product |

Sort options: `newest`, `price-asc`, `price-desc`, `rating-desc`, `title-asc`.

## Scripts

- `npm run dev` — start with hot reload (tsx watch)
- `npm run build` / `npm start` — compile and run production build
- `npm run seed` — reset products collection and ensure demo accounts

## Deploying to Vercel

The repo is Vercel-ready: `api/index.ts` exports the Express app as a serverless function and `vercel.json` rewrites every route to it.

1. Push this repo to GitHub and import it in Vercel (framework preset: **Other**, no build command needed).
2. Add these environment variables in the Vercel project settings:
   - `MONGO_URI` — your Atlas connection string
   - `MONGO_DB` — `yoga-flow`
   - `BETTER_AUTH_SECRET` — a long random string
   - `BETTER_AUTH_URL` — this backend's deployed URL (e.g. `https://yoga-flow-backend.vercel.app`)
   - `CLIENT_ORIGIN` — the deployed frontend URL(s), comma-separated (e.g. `https://yoga-flow.vercel.app,http://localhost:3000`)
3. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` (Vercel functions have no fixed IP).
4. Deploy, then open `https://<backend>.vercel.app/` — you should see the "Server is Running" JSON.

In production the auth cookies are automatically issued with `SameSite=None; Secure` so the cross-domain frontend can use them. Note: browsers that block all third-party cookies (e.g. Safari with default settings) may block cross-domain login — use Chrome/Firefox for the demo, or serve both apps from the same domain.
