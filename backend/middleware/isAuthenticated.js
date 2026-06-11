import express from "express";

function isAuthenticated(req,res,next){
    if(req.isAuthenticated()){           //isAuthenticated() is a method added to req by passport, when we initialize passport
        next();
    }else{
        res.status(401).json({error:"User is not Logged in!"})
        //then we'll redirect to the login page
    }
}

export default isAuthenticated;