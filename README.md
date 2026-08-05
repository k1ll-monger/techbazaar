# TechBazaar

A full-stack tech marketplace where users can buy and sell tech products — built from scratch to learn how a React frontend, an Express/Node backend, Upstash Redis cache, PostgreSQL database, and a custom **Model Context Protocol (MCP)** server work together in production.

**Live site:** https://techbazaar-kappa.vercel.app/

---

### Try it out

The site is pre-seeded with demo data so you can explore it immediately:

| Role | Email | Password |
|---|---|---|
| Admin (dashboard access) | `demo.admin@techbazaar.com` | `password123` |
| Regular user | `arjun.mehta@demo.com` | `password123` |

Or register your own account and try the full flow, including Google OAuth and a real Razorpay test-mode checkout.

---

## Features

- **Model Context Protocol (MCP) Integration** — Exposes TechBazaar's product inventory to external LLMs (e.g. Claude Desktop) in natural language using `@modelcontextprotocol/sdk` and `Zod`.
- **Cache-Aside Layer (Upstash Redis)** — High-performance Redis caching layer for product catalog searches and item details (`⚡ [Cache Hit]` / `🐢 [Cache Miss]`).
- **Authentication** — email/password (bcrypt-hashed) and Google OAuth via Passport.js, with persistent sessions stored in PostgreSQL.
- **Product listings** — create, edit, delete, and browse listings with tags, images, price, and status.
- **Search & filters** — keyword search plus price-range and tag filtering.
- **Recommendations** — tag-based "related products" engine implemented directly in SQL.
- **Ratings & reviews** — for both products and individual sellers/buyers.
- **User profiles** — public profile pages with stats (items sold/bought), average rating, listings, and reviews.
- **Payments** — real checkout flow using Razorpay (test mode), with server-side order creation and HMAC signature verification before marking a product as sold.
- **Admin dashboard** — top sellers, top buyers, and most popular tags, computed with SQL aggregates.
- **Protected routes** — client-side route guarding tied to live session state.

---

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Axios
- Sonner (toasts)

**Backend & MCP Server**
- Node.js + Express
- `@modelcontextprotocol/sdk` (Model Context Protocol)
- Upstash Redis (`@upstash/redis` - Cache-Aside layer)
- Zod (MCP input schema validation)
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

The frontend, backend, and MCP server layer are decoupled:

```
[Claude Desktop / LLMs] ---> [MCP Server (Stdio/SSE)]
                                   |
React (Vercel)  --->  Express REST API (Render)
                           |
               ┌───────────┴───────────┐
               ▼                       ▼
      Upstash Redis Cache      PostgreSQL Database
     (Cache-Aside Layer)        (Normalized 9 Tables)
```

---

## Running Locally

### 1. Backend & MCP Setup

```bash
cd backend
npm install
```

Create a `backend/.env` file with the required environment variables:
```env
PORT=5000
DB_URL=postgresql://username:password@localhost:5432/postgres
SESSION_SECRET=somereallylongrandomstring
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

Run `backend/database/schema.sql` against your PostgreSQL instance before starting the server.

Start the main REST server:
```bash
node index.js
```

---

### 2. Testing the Model Context Protocol (MCP) Server

You can run and test the custom MCP Server locally using either the **MCP Inspector** or **Claude Desktop**.

#### Option A: Quick Test via MCP Inspector (Web UI)
Run the inspector in the `backend/` directory:
```bash
npx @modelcontextprotocol/inspector node mcp/mcpServer.js
```
Open `http://localhost:5173` in your browser to interactively execute `search_inventory` and `get_product_details` tools!

#### Option B: Testing inside Claude Desktop
Add the server entry to your `claude_desktop_config.json`:

* **Windows**: `%APPDATA%\Claude\claude_desktop_config.json` *(or `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` if installed via Microsoft Store)*
* **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "techbazaar": {
      "command": "C:/Program Files/nodejs/node.exe",
      "args": [
        "C:/path/to/techbazaar/backend/mcp/mcpServer.js"
      ],
      "cwd": "C:/path/to/techbazaar/backend"
    }
  }
}
```

Restart Claude Desktop and ask in natural language:
> *"Search TechBazaar inventory for laptops under 60000."*

*For complete step-by-step setup guides, refer to:*
* [HOW_TO_TEST_MCP.md]
---

### 3. Frontend Setup

```bash
cd frontend
npm install
# create a .env with VITE_RAZORPAY_KEY_ID
npm run dev
```

---

Built by [Kaustubh](https://github.com/k1ll-monger)
