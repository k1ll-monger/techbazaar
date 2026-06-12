import express, { urlencoded } from 'express';
import bcrypt from 'bcrypt';
const router = express.Router();

import db from '../db.js';
import passport from 'passport';

router.post('/register' , async(req,res)=>{
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    const hash = await bcrypt.hash(password,10); //hash password with 10 salt rounds

    const data = await db.query('SELECT * FROM users WHERE email = $1',[email]);
    if(data.rows.length > 0){
        //user already exists error
        return res.status(400).json({error:"User Already Exists Broouv"})
        
    }else{
        //user not registered
        await db.query('INSERT INTO users (name,email,password_hash) values ($1,$2,$3)',[name,email,hash])

        res.status(200).json({message:"User REgistered Successfully Broouv"})

    }

})

//login route

router.post('/login', async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;

    const result = await db.query('SELECT * FROM users WHERE email=$1' , [email])
    if(result.rows.length > 0){
        //user exists

        const passwordHashFromDB = result.rows[0].password_hash; //get the hashed password from the database
        
        const doesPasswordExist = await bcrypt.compare( password , passwordHashFromDB );

        if(doesPasswordExist){
            //user login

            const user = result.rows[0];
            //creating a session for the user (logIn() is attached to req by passport, when we initialize passport )
            req.logIn(user, (err)=>{
                if(err){
                    res.status(500).json({error: "could not log in"})
                }else{
                    res.status(200).json({message:"User Logged in Successfully Broo", user: req.user})
                }
            })


        }else{
            res.status(400).json({error:"Incorrect password"});
        }
    }else{
        //user does not exist
        res.status(400).json({error:"User does not exist"});
    }
})

router.post('/logout' , (req,res)=>{

    //this logOut is also provided by passport without this we would have to manually do req.session.destroy() the session
    req.logOut((err)=>{
        if(err){
            res.json({error:"could not log out bro"})
        }else{
            res.json({message:"logged out successfully gang"})
        }
    })
})

// checks if a session exists on the backend and returns the logged in user
// called on every app load to restore user to context after a page refresh
// see App.jsx for more context on this route
router.get('/me', (req, res) => {
    if(req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
})

//login with google
router.get('/google' , passport.authenticate('google' , {scope : ['profile', 'email']}))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'https://techbazaar-kappa.vercel.app/login' }), 
    (req, res) => {
        req.session.save((err) => {
            if(err) {
                console.error('Session save error:', err);
            }
            res.redirect('https://techbazaar-kappa.vercel.app/');
        });
    }
)

export default router;



