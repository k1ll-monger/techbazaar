# How to Test the TechBazaar MCP Server on Your System

This step-by-step guide explains how any developer can set up, run, and verify the **TechBazaar Model Context Protocol (MCP) Server** on their local machine.

---

## 1. Prerequisites & Environment Setup

Before starting, ensure you have:
1. **Node.js** (v18 or higher) installed.
2. A running **PostgreSQL** instance (local or hosted on Render/Supabase) containing the TechBazaar schema.
3. An **Upstash Redis** database instance.

### Create/Verify `backend/.env`
In the `backend/` directory, ensure your `.env` file contains your Database and Redis credentials:

```env
PORT=5000
DB_URL=postgresql://username:password@localhost:5432/tech_bazaar_db
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### Install Dependencies
Open a terminal in the `backend/` directory and run:

```bash
npm install
```

---

## 2. Option A: Instant Verification with MCP Inspector (No Claude Desktop Required)

The official **MCP Inspector** lets you test MCP tools directly inside a browser UI without setting up any desktop client.

### Step 1: Launch the Inspector
In the `backend/` terminal, run:

```bash
npx @modelcontextprotocol/inspector node mcp/mcpServer.js
```

### Step 2: Test Tools in the Browser UI
1. Open the URL displayed in the terminal (usually `http://localhost:5173`).
2. Click on the **Tools** tab in the top navigation bar. You will see two available tools:
   * `search_inventory`
   * `get_product_details`

3. **Test `search_inventory`**:
   * Set `search_query` to `"laptop"`.
   * Set `max_price` to `100000`.
   * Click **Run Tool**.
   * Verify that JSON product results are returned.

4. **Test `get_product_details`**:
   * Set `product_id` to `1` (or any valid ID in your database).
   * Click **Run Tool**.
   * Verify full specs, tags, and average rating are returned.

---

## 3. Option B: Integration & Testing with Claude Desktop

To query TechBazaar inventory using natural language inside **Claude Desktop**, follow these steps:

### Step 1: Locate your `claude_desktop_config.json` Path

Depending on your operating system and installation method, locate the configuration file path:

| Operating System / Installation | Exact Configuration Path |
| :--- | :--- |
| **Windows (Standard Installation)** | `%APPDATA%\Claude\claude_desktop_config.json`<br>`C:\Users\<YourUsername>\AppData\Roaming\Claude\claude_desktop_config.json` |
| **Windows (Microsoft Store Installation)** | `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

---

### Step 2: Find Your System's Node Executable Path

Open a terminal and run the command to get the full absolute path to `node`:

* **Windows (PowerShell / Command Prompt)**:
  ```powershell
  where.exe node
  # Example output: C:\Program Files\nodejs\node.exe
  ```
* **macOS / Linux**:
  ```bash
  which node
  # Example output: /usr/local/bin/node
  ```

---

### Step 3: Add TechBazaar Server Config

Open `claude_desktop_config.json` and add the `techbazaar` server entry under `mcpServers`.

> [!IMPORTANT]
> Replace the paths below with the actual absolute paths on your machine. Use forward slashes (`/`) for all file paths, even on Windows.

```json
{
  "mcpServers": {
    "techbazaar": {
      "command": "C:/Program Files/nodejs/node.exe",
      "args": [
        "C:/path/to/your/techbazaar/backend/mcp/mcpServer.js"
      ],
      "cwd": "C:/path/to/your/techbazaar/backend"
    }
  }
}
```

---

### Step 4: Restart Claude Desktop

1. Close **Claude Desktop** completely.
2. Ensure no background processes remain (on Windows, right-click the Claude icon in the System Tray next to the clock and select **Quit**).
3. Re-open **Claude Desktop**.

---

### Step 5: Test in Natural Language

1. Open a new chat in Claude Desktop.
2. Look for the **Hammer Icon 🔨** in the bottom-right corner of the text prompt box to confirm `techbazaar` is connected.
3. Type natural language queries such as:
   * *"What laptops under $1000 are available in TechBazaar inventory?"*
   * *"Search for audio products or headphones."*
   * *"Give me full specs and customer ratings for product ID 7."*

---

## 4. How to Verify Cache-Aside Performance

The TechBazaar MCP server implements the **Upstash Redis Cache-Aside pattern**:

1. **First Query (Cache Miss)**:
   * When a query is asked for the first time, the backend queries PostgreSQL.
   * You will see a `🐢 [Cache Miss]` log on `stderr`, and the result is cached in Upstash Redis (5-10 min TTL).
2. **Subsequent Queries (Cache Hit)**:
   * When asking the same or similar query again, results are served instantly from Upstash Redis.
   * You will see a `⚡ [Cache Hit]` log on `stderr`, completely bypassing PostgreSQL.
