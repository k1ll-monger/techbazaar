import { z } from 'zod';
import { searchInventory, getProductDetails } from '../services/productService.js';

/**
 * Registers TechBazaar inventory tools on an McpServer instance.
 *
 * @param {import('@modelcontextprotocol/sdk/server/mcp.js').McpServer} server
 */
export function registerTools(server) {
  /**
   * Tool 1: search_inventory
   * Exposes catalog searching with category, price range, and keyword filtering.
   */
  server.tool(
    'search_inventory',
    'Search available TechBazaar product inventory by keyword query, category tag, or price range.',
    {
      category: z
        .string()
        .optional()
        .describe('Category or tag name to filter products (e.g. "Laptops", "Audio", "Peripherals")'),
      min_price: z
        .number()
        .optional()
        .describe('Minimum price threshold'),
      max_price: z
        .number()
        .optional()
        .describe('Maximum price threshold'),
      search_query: z
        .string()
        .optional()
        .describe('Keyword query matching product title or description'),
    },
    async ({ category, min_price, max_price, search_query }) => {
      try {
        const products = await searchInventory({
          category,
          min_price,
          max_price,
          search_query,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  total_results: products.length,
                  query_filters: { category, min_price, max_price, search_query },
                  products,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        console.error('Error in search_inventory tool execution:', error);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to search inventory: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  /**
   * Tool 2: get_product_details
   * Retrieves comprehensive specifications, average rating, and tags for a product by ID.
   */
  server.tool(
    'get_product_details',
    'Get full specifications, average ratings, tags, and availability status for a product by product_id.',
    {
      product_id: z.number().describe('The unique numeric product ID'),
    },
    async ({ product_id }) => {
      try {
        const product = await getProductDetails(product_id);

        if (!product) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Product with ID ${product_id} was not found in the catalog.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`Error in get_product_details tool execution for ID ${product_id}:`, error);
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Failed to fetch product details for ID ${product_id}: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
