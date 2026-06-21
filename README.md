# TechBazaar

A full-stack tech marketplace where users can buy and sell tech products — built from scratch to learn how a React frontend, an Express/Node backend, and a PostgreSQL database actually connect and work together in production.

**Live site:** https://techbazaar-kappa.vercel.app/

---

## Features

- **Authentication** — email/password (bcrypt-hashed) and Google OAuth via Passport.js, with persistent sessions stored in PostgreSQL
- **Product listings** — create, edit, delete, and browse listings with tags, images, price, and status
- **Search & filters** — keyword search plus price-range and tag filtering
- **Recommendations** — tag-based "related products" engine implemented directly in SQL
- **Ratings & reviews** — for both products and individual sellers/buyers
- **User profiles** — public profile pages with stats (items sold/bought), average rating, listings, and reviews
- **Payments** — real checkout flow using Razorpay (test mode), with server-side order creation and HMAC signature verification before marking a product as sold
- **Admin dashboard** — top sellers, top buyers, and most popular tags, computed with SQL aggregates
- **Protected routes** — client-side route guarding tied to live session state

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Axios
- Sonner (toasts)

**Backend**
- Node.js + Express
- PostgreSQL (`pg`)
- Passport.js (Local + Google OAuth20 strategies)
- express-session + connect-pg-simple (DB-backed sessions)
- bcrypt
- Razorpay SDK

**Deployment**
- Frontend → Vercel
- Backend + PostgreSQL → Render

---

## Architecture

The frontend and backend are fully decoupled — React talks to Express purely over a JSON REST API (no server-rendered views). Sessions are cookie-based and persisted in Postgres (instead of memory) so login state survives backend restarts/cold starts on Render's free tier.

```
React (Vercel)  --->  Express REST API (Render)  --->  PostgreSQL (Render)
                          |
                          ├── Passport.js (Local + Google OAuth)
                          └── Razorpay (order creation + signature verification)
```

### Database schema

9 tables: `users`, `products`, `transactions`, `product_ratings`, `user_ratings`, `product_comments`, `user_comments`, `tags`, `product_tags` — with foreign keys, composite unique constraints (e.g. one rating per user per product), and a `product_tags` join table for the many-to-many tag relationship that powers the recommendation engine.

---

## Running locally

**Backend**
```bash
cd backend
npm install
# create a .env with DATABASE_URL, SESSION_SECRET, GOOGLE_CLIENT_ID,
# GOOGLE_CLIENT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, PORT
node index.js
```

**Frontend**
```bash
cd frontend
npm install
# create a .env with VITE_RAZORPAY_KEY_ID
npm run dev
```

Run `backend/db/schema.sql` against your PostgreSQL instance before starting the backend.

---

## What I'd improve next

- JWT-based auth as an alternative to sessions for a fully stateless API
- Image upload (currently takes an image URL rather than a file upload)
- Pagination on product listings and search results
- A real collaborative-filtering recommendation model instead of tag-based similarity

---

Built by [Kaustubh](https://github.com/k1ll-monger)
