import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import db from "../db.js";
const router = express.Router();

router.get('/allproducts' , async(req,res)=>{
    
    try{
        const result = await db.query('SELECT * FROM products WHERE status=$1', ['available']);
        const data = result.rows;
        res.json({products : data})
    }catch(e){
        res.status(500).json({message:"Error Fetching Products from the Database"})
    }

})


router.get('/product/:id' , async(req,res)=>{
    try{
        const productId = req.params.id;
        const result = await db.query('SELECT * FROM products WHERE id=$1', [productId]);
        if(result.rows.length==0){
            return res.status(404).json({message: "Product Not Found"});
        }else{
            res.json({product : result.rows[0]});
        }
        
    }catch(e){
        res.status(500).json({message:"Error in getting the requested product"});
    }
})

router.post('/addproduct' , isAuthenticated, async(req,res)=>{
    const userId=req.user.id;
    const name=req.body.name;
    const description =req.body.description;
    const price = req.body.price;
    const image_url = req.body.image_url;

    try{
        const result = await db.query('INSERT INTO products (user_id,name,description,price,image_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',[userId,name,description,price,image_url]);
        res.status(200).json({message:"Product Added Successfully",product : result.rows[0]});
    }catch(e){
        res.status(500).json({error:"Error while Adding the Product"});
    }
})


router.put('/editproduct/:id' , isAuthenticated, async(req,res)=>{
    const productId = req.params.id;
    const currentUserId = req.user.id;

    //
    const name=req.body.name;
    const description =req.body.description;
    const price = req.body.price;
    const image_url = req.body.image_url;
    const status = req.body.status;
    
    try{
       const result = await db.query('SELECT * FROM products WHERE id=$1 and user_id=$2', [productId,currentUserId]);
       if(result.rows.length == 0){
        return res.status(403).json({error:"You're not the owner of this product, or product does not exist"})
       }else{
        const data = await db.query('UPDATE products SET name=$1 , description=$2, price=$3, image_url=$4, status=$5 WHERE id = $6 RETURNING *',[name,description,price,image_url,status,productId]);
        res.json({message:"Successfully Updated" , product : data.rows[0]})
       }
    }catch(e){
        res.json({error: "Unable to updata item"});
    }
})

router.delete('/deleteproduct/:id' , isAuthenticated, async(req,res)=>{
    const productId = req.params.id;
    const currentUser = req.user.id;

    //check if product belongs to user
    try{
        const result = await db.query('SELECT * FROM products WHERE user_id = $1 AND id=$2' , [currentUser,productId])
        if(result.rows.length==0){
            res.status(403).json({message:"Product does not exist, or user not authorized to delete particular Product"})
        }else{
            await db.query('DELETE FROM products WHERE id=$1' , [productId]);
            res.json({message: "Product Removed Successfully"})
        }
    }catch(e){
        res.json({error: "Unable to delete item"});
    }
}) 


router.get('/productsByFilter' , async(req,res) => {
    const maxPrice = req.query.maxPrice;
    const minPrice = req.query.minPrice;
    const tagID = req.query.tagID;
    const sort = req.query.sort;

    const q = req.query.q;

    let query = 'SELECT * FROM products WHERE 1=1 AND status=$1'
    let values = ['available'];
    let counter = 2;

    if(q) {
    query += ` AND (name ILIKE $${counter} OR description ILIKE $${counter})`;
    values.push(`%${q}%`);
    counter++;
    }   

    if(minPrice){
        query=query+` AND price>=$${counter}`
        values.push(minPrice);
        counter++;
    }

    if(maxPrice){
        query=query+` AND price<=$${counter}`
        values.push(maxPrice);
        counter++;
    }

    if(tagID) {
        query += ` AND id IN (SELECT product_id FROM product_tags WHERE tag_id = $${counter})`;
        values.push(tagID);
        counter++;
    }

    if(sort){
        if(sort == 'newest'){
            query=query + ' ORDER BY created_at DESC';
        }else{
            query=query + ' ORDER BY created_at ASC';
        }
    }
    
    try{
        const result = await db.query(query,values);
        const filteredProducts = result.rows;

        res.json({message:"Fetched Products Successfully", products: filteredProducts})
    }catch(e){
        res.status(500).json({error:"Could Fetch Requested Items"})
    }

})


router.get('/product/:id/ratings', async(req,res)=>{
    const id = req.params.id;

    try{
        const result = await db.query('SELECT * FROM product_ratings WHERE product_id=$1', [id]);
        res.json({ratings : result.rows});
    }catch(e){
        res.status(500).json({error: "Could not Fetch Ratings from DB"})
    }
})


router.get('/product/:id/comments',  async(req,res)=>{
    const id = req.params.id;

    try{
        const result = await db.query('SELECT * FROM product_comments WHERE product_id=$1', [id]);
        res.json({comments : result.rows});
    }catch(e){
        res.status(500).json({error: "Could not Fetch comments from DB"})
    }
})


router.post('/product/:id/comment', isAuthenticated, async(req,res)=>{
    try{
        const productId = req.params.id;
        const userId = req.user.id;
        const { content, parent_comment_id } = req.body;
        const result = await db.query(
            'INSERT INTO product_comments (product_id, user_id, content, parent_comment_id) VALUES ($1,$2,$3,$4) RETURNING *',
            [productId, userId, content, parent_comment_id || null]
        );
        res.json({comment: result.rows[0]});
    }catch(e){
        res.status(500).json({error:"Could not add comment"});
    }
})

router.post('/product/:id/rate', isAuthenticated, async(req,res)=>{
    try{
        const productId = req.params.id;
        const userId = req.user.id;
        const { score } = req.body;
        const result = await db.query(
            'INSERT INTO product_ratings (product_id, user_id, score) VALUES ($1,$2,$3) ON CONFLICT (product_id, user_id) DO UPDATE SET score=$3 RETURNING *',
            [productId, userId, score]
        );
        res.json({rating: result.rows[0]});
    }catch(e){
        res.status(500).json({error:"Could not add rating"});
    }
})


router.get('/product/:id/related', async(req,res)=>{
    try{
        const productId = req.params.id;
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
        res.json({products: result.rows});
    }catch(e){
        res.status(500).json({error:"Could not fetch related products"});
    }
})

router.get('/tags', async(req, res)=>{
    try{
        const result = await db.query('SELECT * FROM tags');
        res.json({tags: result.rows});
    }catch(e){
        res.status(500).json({error:"Could not fetch tags"});
    }
})

router.post('/product/:id/tags', isAuthenticated, async(req, res)=>{
    try{
        const productId = req.params.id;
        const { tagIds } = req.body;
        
        // delete existing tags first
        await db.query('DELETE FROM product_tags WHERE product_id=$1', [productId]);
        
        // insert new tags
        for(const tagId of tagIds){
            await db.query('INSERT INTO product_tags (product_id, tag_id) VALUES ($1,$2)', [productId, tagId]);
        }
        res.json({message:"Tags updated successfully"});
    }catch(e){
        res.status(500).json({error:"Could not update tags"});
    }
})

export default router;