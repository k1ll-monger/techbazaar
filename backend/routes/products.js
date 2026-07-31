import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import db from "../db.js";
import { redis } from "../config/redis.js"; // Adjust path to your redis config if needed

const router = express.Router();

// -----------------------------------------------------------------------------
// GET /allproducts (Cached for 5 mins)
// -----------------------------------------------------------------------------
router.get('/allproducts', async (req, res) => {
    const cacheKey = 'products:all';

    try {
        // 1. Check Redis cache
        const cachedProducts = await redis.get(cacheKey);
        if (cachedProducts) {
            console.log('⚡ Cache Hit: allproducts');
            return res.json({ products: cachedProducts });
        }

        // 2. Fetch from PostgreSQL
        console.log('🐢 Cache Miss: allproducts');
        const result = await db.query('SELECT * FROM products WHERE status=$1', ['available']);
        const data = result.rows;

        // 3. Store in Redis (TTL: 300 seconds / 5 mins)
        await redis.set(cacheKey, data, { ex: 300 });

        res.json({ products: data });
    } catch (e) {
        console.error('Redis/DB Error:', e);
        // Fallback: Query DB directly if Redis fails
        try {
            const result = await db.query('SELECT * FROM products WHERE status=$1', ['available']);
            res.json({ products: result.rows });
        } catch (dbErr) {
            res.status(500).json({ message: "Error Fetching Products from the Database" });
        }
    }
});

// -----------------------------------------------------------------------------
// GET /product/:id (Cached for 10 mins)
// -----------------------------------------------------------------------------
router.get('/product/:id', async (req, res) => {
    const productId = req.params.id;
    const cacheKey = `product:${productId}`;

    try {
        const cachedProduct = await redis.get(cacheKey);
        if (cachedProduct) {
            console.log(`⚡ Cache Hit: product ${productId}`);
            return res.json({ product: cachedProduct });
        }

        console.log(`🐢 Cache Miss: product ${productId}`);
        const result = await db.query('SELECT * FROM products WHERE id=$1', [productId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        const product = result.rows[0];
        // Cache single product for 10 mins
        await redis.set(cacheKey, product, { ex: 600 });

        res.json({ product });
    } catch (e) {
        res.status(500).json({ message: "Error in getting the requested product" });
    }
});

// -----------------------------------------------------------------------------
// POST /addproduct (Invalidates 'products:all')
// -----------------------------------------------------------------------------
router.post('/addproduct', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const { name, description, price, image_url } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO products (user_id,name,description,price,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [userId, name, description, price, image_url]
        );

        // Clear the allproducts cache so users see the newly added item
        await redis.del('products:all');

        res.status(200).json({ message: "Product Added Successfully", product: result.rows[0] });
    } catch (e) {
        res.status(500).json({ error: "Error while Adding the Product" });
    }
});

// -----------------------------------------------------------------------------
// PUT /editproduct/:id (Invalidates specific product cache + 'products:all')
// -----------------------------------------------------------------------------
router.put('/editproduct/:id', isAuthenticated, async (req, res) => {
    const productId = req.params.id;
    const currentUserId = req.user.id;
    const { name, description, price, image_url, status } = req.body;

    try {
        const result = await db.query('SELECT * FROM products WHERE id=$1 and user_id=$2', [productId, currentUserId]);
        if (result.rows.length === 0) {
            return res.status(403).json({ error: "You're not the owner of this product, or product does not exist" });
        } else {
            const data = await db.query(
                'UPDATE products SET name=$1 , description=$2, price=$3, image_url=$4, status=$5 WHERE id = $6 RETURNING *',
                [name, description, price, image_url, status, productId]
            );

            // Invalidate both individual product cache and all products cache
            await redis.del(`product:${productId}`, 'products:all');

            res.json({ message: "Successfully Updated", product: data.rows[0] });
        }
    } catch (e) {
        res.json({ error: "Unable to update item" });
    }
});

// -----------------------------------------------------------------------------
// DELETE /deleteproduct/:id (Invalidates specific product cache + 'products:all')
// -----------------------------------------------------------------------------
router.delete('/deleteproduct/:id', isAuthenticated, async (req, res) => {
    const productId = req.params.id;
    const currentUser = req.user.id;

    try {
        const result = await db.query('SELECT * FROM products WHERE user_id = $1 AND id=$2', [currentUser, productId]);
        if (result.rows.length === 0) {
            res.status(403).json({ message: "Product does not exist, or user not authorized to delete particular Product" });
        } else {
            await db.query('DELETE FROM products WHERE id=$1', [productId]);

            // Clear cache
            await redis.del(`product:${productId}`, 'products:all');

            res.json({ message: "Product Removed Successfully" });
        }
    } catch (e) {
        res.json({ error: "Unable to delete item" });
    }
});

// -----------------------------------------------------------------------------
// GET /productsByFilter (No Redis caching - Dynamic Query Parameters)
// -----------------------------------------------------------------------------
router.get('/productsByFilter', async (req, res) => {
    const { maxPrice, minPrice, tagID, sort, q } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1 AND status=$1';
    let values = ['available'];
    let counter = 2;

    if (q) {
        query += ` AND (name ILIKE $${counter} OR description ILIKE $${counter})`;
        values.push(`%${q}%`);
        counter++;
    }

    if (minPrice) {
        query += ` AND price>=$${counter}`;
        values.push(minPrice);
        counter++;
    }

    if (maxPrice) {
        query += ` AND price<=$${counter}`;
        values.push(maxPrice);
        counter++;
    }

    if (tagID) {
        query += ` AND id IN (SELECT product_id FROM product_tags WHERE tag_id = $${counter})`;
        values.push(tagID);
        counter++;
    }

    if (sort) {
        if (sort === 'newest') {
            query += ' ORDER BY created_at DESC';
        } else {
            query += ' ORDER BY created_at ASC';
        }
    }

    try {
        const result = await db.query(query, values);
        res.json({ message: "Fetched Products Successfully", products: result.rows });
    } catch (e) {
        res.status(500).json({ error: "Could Not Fetch Requested Items" });
    }
});

// -----------------------------------------------------------------------------
// Comments & Ratings (Dynamic, non-cached or quick fallback)
// -----------------------------------------------------------------------------
router.get('/product/:id/ratings', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM product_ratings WHERE product_id=$1', [id]);
        res.json({ ratings: result.rows });
    } catch (e) {
        res.status(500).json({ error: "Could not Fetch Ratings from DB" });
    }
});

router.get('/product/:id/comments', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query('SELECT * FROM product_comments WHERE product_id=$1', [id]);
        res.json({ comments: result.rows });
    } catch (e) {
        res.status(500).json({ error: "Could not Fetch comments from DB" });
    }
});

router.post('/product/:id/comment', isAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;
        const { content, parent_comment_id } = req.body;
        const result = await db.query(
            'INSERT INTO product_comments (product_id, user_id, content, parent_comment_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [productId, userId, content, parent_comment_id || null]
        );
        res.json({ comment: result.rows[0] });
    } catch (e) {
        res.status(500).json({ error: "Could not add comment" });
    }
});

router.post('/product/:id/rate', isAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;
        const { score } = req.body;
        const result = await db.query(
            'INSERT INTO product_ratings (product_id, user_id, score) VALUES ($1,$2,$3) ON CONFLICT (product_id, user_id) DO UPDATE SET score=$3 RETURNING *',
            [productId, userId, score]
        );
        res.json({ rating: result.rows[0] });
    } catch (e) {
        res.status(500).json({ error: "Could not add rating" });
    }
});

// -----------------------------------------------------------------------------
// GET /product/:id/related (Cached for 10 mins)
// -----------------------------------------------------------------------------
router.get('/product/:id/related', async (req, res) => {
    const productId = req.params.id;
    const cacheKey = `product:${productId}:related`;

    try {
        const cachedRelated = await redis.get(cacheKey);
        if (cachedRelated) {
            console.log(`⚡ Cache Hit: related for ${productId}`);
            return res.json({ products: cachedRelated });
        }

        const result = await db.query(`
            SELECT DISTINCT p.* FROM products p
            JOIN product_tags pt ON p.id = pt.product_id
            WHERE pt.tag_id IN (
                SELECT tag_id FROM product_tags WHERE product_id = $1
            )
            AND p.id != $1
            AND p.status = 'available'
            LIMIT 4
        `, [productId]);

        await redis.set(cacheKey, result.rows, { ex: 600 });
        res.json({ products: result.rows });
    } catch (e) {
        res.status(500).json({ error: "Could not fetch related products" });
    }
});

// -----------------------------------------------------------------------------
// GET /tags (Cached for 1 hour)
// -----------------------------------------------------------------------------
router.get('/tags', async (req, res) => {
    const cacheKey = 'tags:all';

    try {
        const cachedTags = await redis.get(cacheKey);
        if (cachedTags) {
            return res.json({ tags: cachedTags });
        }

        const result = await db.query('SELECT * FROM tags');
        await redis.set(cacheKey, result.rows, { ex: 3600 }); // Tags rarely change, cache for 1 hr
        res.json({ tags: result.rows });
    } catch (e) {
        res.status(500).json({ error: "Could not fetch tags" });
    }
});

router.post('/product/:id/tags', isAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        const { tagIds } = req.body;

        await db.query('DELETE FROM product_tags WHERE product_id=$1', [productId]);

        for (const tagId of tagIds) {
            await db.query('INSERT INTO product_tags (product_id, tag_id) VALUES ($1,$2)', [productId, tagId]);
        }

        // Invalidate related cache since tags changed
        await redis.del(`product:${productId}:related`);

        res.json({ message: "Tags updated successfully" });
    } catch (e) {
        res.status(500).json({ error: "Could not update tags" });
    }
});

export default router;