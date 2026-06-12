import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import db from './db.js';
import dotenv from 'dotenv'

dotenv.config();

passport.use(new GoogleStrategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://techbazaar-backend-webservice.onrender.com/api/auth/google/callback"
    } , async (accessToken, refreshToken, profile, done) => {
        
            try{
                const result = await db.query("SELECT * FROM users WHERE google_id = $1", [profile.id])
            
                if(result.rows.length > 0){
                    const user = result.rows[0];
                    done(null,user)
                }else{
                    const newUserInsert = await db.query('INSERT INTO users (name, email, google_id) VALUES ($1,$2,$3) RETURNING *' ,
                                                            [profile.displayName, profile.emails[0].value, profile.id ])
                    const newUser = newUserInsert.rows[0]
                    done(null, newUser)
                }
            }catch(err)
            {
                done(err,null);
            }
}))

passport.serializeUser((user,done) => {
    done(null,user.id);
})

passport.deserializeUser( async (id,done)=>{
    try{
        const result = await db.query('SELECT * FROM users WHERE id = $1' , [id]);
        if(result.rows.length==0){
            done(null,false)  //no error but user does not exist
        }else{
            done(null, result.rows[0]); //no error here's the user
        }
    }catch(err){
        done(err,null);  //error
    }
})

export default passport