import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import isAuthenticated from "../middleware/isAuthenticated.js";
import db from "../db.js";

const router = express.Router();

// Initialize Razorpay SDK instance using environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. GENERATE SECURE ORDER FOR RAZORPAY FRONTEND
router.post('/buy/:id/create-order', isAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        const buyerId = req.user.id;

        const productData = await db.query('SELECT * FROM products WHERE id = $1', [productId]);

        // Check if product exists
        if (productData.rows.length === 0) {
            return res.status(404).json({ error: "Product does not exist!" });
        }
        
        const product = productData.rows[0];

        // Check if product is still available
        if (product.status !== 'available') {
            return res.status(400).json({ error: "Product not available right now!" });
        }

        // Prevent buying own product
        if (buyerId === product.user_id) {
            return res.status(400).json({ error: "You cannot purchase your own product listing!" });
        }   

        // Razorpay expects currency calculations in the smallest fractional unit (Paise for INR)
        // Example: ₹500 becomes 500 * 100 = 50000 paise
        const options = {
            amount: Math.round(Number(product.price) * 100), 
            currency: "INR",
            receipt: `receipt_prod_${productId}_${buyerId}_${Date.now()}`,
            notes: {
                productId: productId,
                buyerId: buyerId,
                sellerId: product.user_id
            }
        };

        const order = await razorpay.orders.create(options);
        
        // Return order configurations to the client frontend
        res.json({ success: true, order });
    } catch (e) {
        console.error("Razorpay Order Creation Error: ", e);
        res.status(500).json({ error: "Could not initiate payment order context." });
    }
});

// 2. VERIFY SIGNATURE AND UPDATE DATABASE IF AUTHENTIC
router.post('/buy/verify-payment', isAuthenticated, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId } = req.body;
        const buyerId = req.user.id;

        // Verify cryptographic data authenticity using your secret key
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Transaction verification failed. Fraud detected." });
        }

        // Fetching structural info to complete transaction processing 
        const productData = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productData.rows.length === 0 || productData.rows[0].status !== 'available') {
            return res.status(400).json({ error: "Product listing became unavailable during processing." });
        }

        const product = productData.rows[0];

        // Execute transaction record inserts and change product state to sold
        await db.query(
            'INSERT INTO transactions (product_id, buyer_id, seller_id, amount) VALUES ($1, $2, $3, $4)', 
            [productId, buyerId, product.user_id, product.price]
        );
        
        await db.query('UPDATE products SET status = $2 WHERE id = $1', [productId, 'sold']);

        res.json({ success: true, message: "Item Bought successfully!" });
    } catch (e) {
        console.error("Razorpay Database Sync Error: ", e);
        res.status(500).json({ error: "Payment received, but database status tracking update failed." });
    }
});

// 3. PURCHASE HISTORY ROUTE
router.get('/purchases', isAuthenticated, async (req, res) => {
    try {
        const userPurchases = await db.query(
            'SELECT * FROM products WHERE id IN (SELECT product_id FROM transactions WHERE buyer_id = $1)', 
            [req.user.id]
        );
        res.json({ products: userPurchases.rows });
    } catch (e) {
        res.status(500).json({ error: "Could not fetch your purchase history" });
    }
});

// 4. SALES HISTORY ROUTE
router.get('/sales', isAuthenticated, async (req, res) => {
    try {
        const userSales = await db.query(
            'SELECT * FROM products WHERE id IN (SELECT product_id FROM transactions WHERE seller_id = $1)', 
            [req.user.id]
        );
        res.json({ products: userSales.rows });
    } catch (e) {
        res.status(500).json({ error: "Could not fetch your sales history" });
    }
});

export default router;