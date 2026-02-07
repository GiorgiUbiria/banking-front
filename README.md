# Mini Banking Platform — Frontend

React frontend for the Mini Banking Platform assessment. Provides login, dashboard (balances, transfer, exchange), transaction history, and ledger views.

## Repository & deployment

| | URL |
|---|-----|
| **Repository** | https://github.com/GiorgiUbiria/banking-front |
| **Deployed app** | https://inquire-banking.netlify.app/ |

Backend API: https://banking-system-7hqp.onrender.com/

## Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** + **shadcn/ui**
- **TanStack Query** (server state) + **Zustand** (auth state)
- **React Router** v7
- **Axios** (API client)
- **Zod** (validation)

## Prerequisites

- Node.js 18+
- Backend API running (see [banking_system](../banking_system) for backend setup)

## Setup

1. **Clone and enter the project**
   ```bash
   cd banking-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL` to your backend URL:
     - Local: `http://localhost:8080`
     - Production: your backend URL (e.g. Render)

4. **Run locally**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173` (or the port Vite prints).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server        |
| `npm run build`| Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint              |

## Environment

| Variable             | Description                    | Example                |
|----------------------|--------------------------------|------------------------|
| `VITE_API_BASE_URL`  | Backend API base URL           | `http://localhost:8080` |

## Deployment

- **Host:** Netlify  
- Frontend is built with `npm run build`; output is in `dist/`.  
- Set `VITE_API_BASE_URL` in Netlify to the deployed backend URL (e.g. Render) so the app talks to the correct API.

## Features

- **Login** — Email/password (pre-seeded users: `user1@test.com`, `user2@test.com`, `user3@test.com`; password: see backend README).
- **Dashboard** — USD/EUR balances, last 5 transactions, transfer form, exchange form (rate 1 USD = 0.92 EUR).
- **Transfer** — From account, recipient account ID, amount; confirmation before submit.
- **Exchange** — Source currency, amount, converted amount preview; confirmation before submit.
- **Transactions** — Paginated list with type filter (transfer / exchange).
- **Ledger** — Ledger entries with optional filters.

## Backend

This app expects the Mini Banking backend API (Go, Chi, PostgreSQL). User management uses **pre-seeded test users** (Option B); there is no registration flow in the frontend.
