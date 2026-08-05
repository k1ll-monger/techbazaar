// Redirect all standard log outputs to stderr to ensure process.stdout remains 100% clean for JSON-RPC MCP messages
console.log = (...args) => console.error(...args);

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools.js';

/**
 * Initialize the TechBazaar Model Context Protocol (MCP) Server.
 */
const server = new McpServer({
  name: 'techbazaar-mcp-server',
  version: '1.0.0',
});

// Register product catalog tools
registerTools(server);

/**
 * Start the MCP Server using StdioServerTransport.
 */
async function startServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('====================================================');
    console.error('🚀 TechBazaar MCP Server running on stdio transport');
    console.error('   Ready to process natural language queries for LLMs.');
    console.error('====================================================');
  } catch (error) {
    console.error('❌ Error starting TechBazaar MCP Server:', error);
    process.exit(1);
  }
}

startServer();
