import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';

import passport from './passport.js';

import connectPgSimple from 'connect-pg-simple';
import db from './db.js';

dotenv.config()


const app = express();
app.set('trust proxy', 1);
const PgSession = connectPgSimple(session);

app.use(express.json())
app.use(cors({
    origin: ['http://localhost:5173', 'https://techbazaar-kappa.vercel.app'],
    credentials: true
}))


// Session middleware — keeps users logged in between requests
// secret: signs the cookie so it can't be tampered with
// resave: false — don't save session again if nothing changed
// saveUninitialized: false — don't create a session until user logs in
// cookie.secure: false — set to true in production when you have HTTPS
app.use(session({
    store: new PgSession({
        pool: db,
        tableName: 'session',
        pruneSessionInterval: 60 * 15 // cleanup expired sessions every 15 minutes
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}))

//passport middleware
app.use(passport.initialize()); // Passport needs to set itself up on that request. 
                                // Specifically it creates req.user and sets it to undefined by default(among other things).

app.use(passport.session());    //  reads the session cookie, 
                                //  finds the user id stored in it, and calls deserializeUser to
                                //  fetch the full user and attach it to req.user.


// example -> "whenever a request comes in that starts with /api/auth, hand it over to auth.js to handle."
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);




app.get('/' , (req,res) =>{
    res.json({message : "App is running dw"})
})

app.listen(process.env.PORT, ()=>{
    console.log("Server is Running bro")
})
