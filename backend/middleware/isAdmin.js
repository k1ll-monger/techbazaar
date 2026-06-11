import express from "express";

function isAdmin(req, res, next) {
    if(req.isAuthenticated() && req.user.is_admin) {
        next();
    } else {
        res.status(403).json({ error: "Access denied" });
    }
}

export default isAdmin;