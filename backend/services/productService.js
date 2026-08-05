import db from '../db.js';
import { redis } from '../config/redis.js';

/**
 * Service module handling product inventory queries and detail lookups.
 * Implements the Cache-Aside pattern using Upstash Redis with PostgreSQL fallback.
 */

/**
 * Search product inventory with optional filters.
 * Checks Upstash Redis cache first; queries PostgreSQL and sets cache on miss.
 *
 * @param {Object} filters
 * @param {string} [filters.category] - Tag or category name filter
 * @param {number} [filters.min_price] - Minimum price bound
 * @param {number} [filters.max_price] - Maximum price bound
 * @param {string} [filters.search_query] - Keyword match for name or description
 * @returns {Promise<Array>} List of matching available products
 */
export async function searchInventory({ category, min_price, max_price, search_query } = {}) {
  // Normalize parameters to build a deterministic cache key
  const normalizedParams = {
    category: category ? category.trim().toLowerCase() : '',
    min_price: min_price ?? '',
    max_price: max_price ?? '',
    search_query: search_query ? search_query.trim().toLowerCase() : '',
  };

  const cacheKey = `products:search:${JSON.stringify(normalizedParams)}`;

  try {
    // 1. Upstash Redis Cache Check
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`⚡ [Cache Hit] searchInventory: ${cacheKey}`);
      return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    }
  } catch (err) {
    console.warn('⚠️ Redis read error in searchInventory (bypassing cache):', err.message);
  }

  // 2. Cache Miss - Query PostgreSQL
  console.log(`🐢 [Cache Miss] searchInventory querying PostgreSQL`);

  let query = 'SELECT DISTINCT p.* FROM products p';
  const conditions = ["p.status = 'available'"];
  const values = [];
  let counter = 1;

  if (category) {
    query += ' JOIN product_tags pt ON p.id = pt.product_id JOIN tags t ON pt.tag_id = t.id';
    conditions.push(`t.name ILIKE $${counter}`);
    values.push(`%${category}%`);
    counter++;
  }

  if (search_query) {
    conditions.push(`(p.name ILIKE $${counter} OR p.description ILIKE $${counter})`);
    values.push(`%${search_query}%`);
    counter++;
  }

  if (min_price !== undefined && min_price !== null && !isNaN(Number(min_price))) {
    conditions.push(`p.price >= $${counter}`);
    values.push(Number(min_price));
    counter++;
  }

  if (max_price !== undefined && max_price !== null && !isNaN(Number(max_price))) {
    conditions.push(`p.price <= $${counter}`);
    values.push(Number(max_price));
    counter++;
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY p.created_at DESC';

  const result = await db.query(query, values);
  const products = result.rows;

  // 3. Update Upstash Redis Cache (TTL: 300 seconds / 5 mins)
  try {
    await redis.set(cacheKey, products, { ex: 300 });
  } catch (err) {
    console.warn('⚠️ Redis write error in searchInventory:', err.message);
  }

  return products;
}

/**
 * Get single product details by product ID.
 * Checks Upstash Redis cache first; queries PostgreSQL on miss.
 *
 * @param {number|string} productId - Unique product ID
 * @returns {Promise<Object|null>} Product details object or null if not found
 */
export async function getProductDetails(productId) {
  const numericId = Number(productId);
  if (isNaN(numericId)) {
    throw new Error(`Invalid product ID: ${productId}`);
  }

  const cacheKey = `product:details:${numericId}`;

  try {
    // 1. Upstash Redis Cache Check
    const cachedProduct = await redis.get(cacheKey);
    if (cachedProduct) {
      console.log(`⚡ [Cache Hit] getProductDetails: ${cacheKey}`);
      return typeof cachedProduct === 'string' ? JSON.parse(cachedProduct) : cachedProduct;
    }
  } catch (err) {
    console.warn(`⚠️ Redis read error for product ${numericId} (bypassing cache):`, err.message);
  }

  // 2. Cache Miss - Query PostgreSQL
  console.log(`🐢 [Cache Miss] getProductDetails querying PostgreSQL for ID ${numericId}`);

  const productResult = await db.query('SELECT * FROM products WHERE id = $1', [numericId]);

  if (productResult.rows.length === 0) {
    return null;
  }

  const product = productResult.rows[0];

  // Fetch associated tags and rating overview for richer detail
  const tagsResult = await db.query(
    `SELECT t.name FROM tags t 
     JOIN product_tags pt ON t.id = pt.tag_id 
     WHERE pt.product_id = $1`,
    [numericId]
  );

  const ratingsResult = await db.query(
    `SELECT AVG(score)::numeric(10,2) as average_rating, COUNT(*)::int as total_ratings 
     FROM product_ratings 
     WHERE product_id = $1`,
    [numericId]
  );

  const fullProduct = {
    ...product,
    tags: tagsResult.rows.map((r) => r.name),
    average_rating: ratingsResult.rows[0]?.average_rating ? parseFloat(ratingsResult.rows[0].average_rating) : null,
    total_ratings: ratingsResult.rows[0]?.total_ratings || 0,
  };

  // 3. Cache result in Upstash Redis (TTL: 600 seconds / 10 mins)
  try {
    await redis.set(cacheKey, fullProduct, { ex: 600 });
  } catch (err) {
    console.warn(`⚠️ Redis write error for product ${numericId}:`, err.message);
  }

  return fullProduct;
}
