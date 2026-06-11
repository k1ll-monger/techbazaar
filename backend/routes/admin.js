import express from 'express';
import isAuthenticated from '../middleware/isAuthenticated.js';
import isAdmin from '../middleware/isAdmin.js';
import db from '../db.js';
const router = express.Router();


//I USED AI TO GET QUERIES IN THIS PARTICULAR FILE GANG< Plz revise kaustubh >


//top sellers

router.get('/topsellers' , isAuthenticated, isAdmin, async(req,res)=>{
    try{
        const result = await db.query('SELECT users.id, users.name, COUNT(*) as total_sales FROM transactions JOIN users ON transactions.seller_id = users.id GROUP BY users.id, users.name ORDER BY total_sales DESC LIMIT 10');
        res.json({topSellers : result.rows})
    }catch(e){
        res.status(500).json({error:"Couldn't get Top Sellers from DB"})
    }
})

//top buyer
router.get('/topbuyers' , isAuthenticated, isAdmin, async(req,res)=>{
    try{
        const result = await db.query('SELECT users.id, users.name, COUNT(*) as total_buys FROM transactions JOIN users ON transactions.buyer_id = users.id GROUP BY users.id, users.name ORDER BY total_buys DESC LIMIT 10');
        res.json({topBuyers : result.rows})
    }catch(e){
        res.status(500).json({error:"Couldn't get Top Buyers from DB"})
    }
})


//top tags
router.get('/populartags', isAuthenticated, isAdmin, async(req, res) => {
    try {
        const result = await db.query(`
            SELECT tags.name, COUNT(*) as total_sales
            FROM transactions
            JOIN products ON transactions.product_id = products.id
            JOIN product_tags ON products.id = product_tags.product_id
            JOIN tags ON product_tags.tag_id = tags.id
            GROUP BY tags.name
            ORDER BY total_sales DESC
            LIMIT 10
        `);
        res.json({ popularTags: result.rows });
    } catch(e) {
        res.status(500).json({ error: "Couldn't get popular tags" });
    }
})


export default router;