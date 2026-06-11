import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import db from "../db.js";

const router = express.Router();

router.get('/user/:id' , isAuthenticated, async(req,res)=>{
    const userId = req.params.id;
    try
    {
        const userinfo = await db.query('SELECT id, name, email, bio, profile_image_url, created_at FROM users where id=$1', [userId]);
        if(userinfo.rows.length == 0) return res.status(404).json({message:"User does not exist"})
        res.status(200).json({message:"User Fetched Successfully",user: userinfo.rows[0]})    
        
    }catch(e){
        res.status(500).json({error:"Could Not Get User"})
    }

})

router.get('/user/:id/stats', isAuthenticated, async(req,res)=>{
    const userId = req.params.id;

    try{
        const result = await db.query('SELECT AVG(score) as "userRating" FROM user_ratings WHERE  rated_user_id = $1', [userId]);
        const itemsSold = await db.query('SELECT COUNT(*) as count FROM transactions WHERE seller_id = $1', [userId]);
        const itemsBought = await db.query('SELECT COUNT(*) as count FROM transactions WHERE buyer_id = $1', [userId]);

        res.json({rating : result.rows[0].userRating,
                  totalSold: itemsSold.rows[0].count,
                  totalBought: itemsBought.rows[0].count
        })
    }catch(e){
        res.status(500).json({error: "Could not fetch User stats"})
    }
})


router.get('/user/:id/ratings' , isAuthenticated, async(req,res)=>{
    try{
        const userId = req.params.id;
        const userRating = await db.query('SELECT * FROM user_ratings WHERE rated_user_id=$1', [userId]);
        res.status(200).json({ratings: userRating.rows})
    }catch(e){
        res.status(500).json({message:"Could not fetch ratings"})
    }
})

router.get('/user/:id/comments' , isAuthenticated, async(req,res)=>{
    try{
        const userId = req.params.id;
        const userComments = await db.query('SELECT * FROM user_comments WHERE target_user_id=$1', [userId]);
        res.status(200).json({comments: userComments.rows})
    }catch(e){
        res.status(500).json({message:"Could not fetch comments"})
    }
})

router.put('/edituser', isAuthenticated, async(req,res)=>{
    const userId = req.user.id;
    const name = req.body.name;
    const bio = req.body.bio;
    const image = req.body.image;

    try{
        const updatedUser = await db.query('UPDATE users SET name=$1,bio=$2,profile_image_url=$3 WHERE id=$4 RETURNING *', [name,bio,image,userId])
        res.json({user:updatedUser.rows[0]})
    }catch(e){
        res.status(500).json({error:"Could not update user"})
    }
})


router.get('/user/:id/products', isAuthenticated, async(req,res)=>{
    try{
        const userId = req.params.id;
        const result = await db.query('SELECT * FROM products WHERE user_id=$1', [userId]);
        res.json({products: result.rows});
    }catch(e){
        res.status(500).json({error:"Could not fetch user products"});
    }
})

router.post('/user/:id/comment', isAuthenticated, async(req,res)=>{
    try{
        const targetUserId = req.params.id;
        const authorUserId = req.user.id;
        const { content } = req.body;
        const result = await db.query(
            'INSERT INTO user_comments (target_user_id, author_user_id, content) VALUES ($1,$2,$3) RETURNING *',
            [targetUserId, authorUserId, content]
        );
        res.json({comment: result.rows[0]});
    }catch(e){
        res.status(500).json({error:"Could not add comment"});
    }
})

router.post('/user/:id/rate', isAuthenticated, async(req,res)=>{
    try{
        const ratedUserId = req.params.id;
        const raterUserId = req.user.id;
        const { score } = req.body;
        const result = await db.query(
            'INSERT INTO user_ratings (rated_user_id, rater_user_id, score) VALUES ($1,$2,$3) ON CONFLICT (rated_user_id, rater_user_id) DO UPDATE SET score=$3 RETURNING *',
            [ratedUserId, raterUserId, score]
        );
        res.json({rating: result.rows[0]});
    }catch(e){
        res.status(500).json({error:"Could not add rating"});
    }
})

export default router;