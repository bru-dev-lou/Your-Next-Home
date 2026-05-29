import express from "express";
import db from "../../database/database.ts";

const router = express.Router();

router.get("/", (req, res) => {
    const userData = req.user;

    const userName = db.prepare(`SELECT name FROM property_owners WHERE username = ?`).get(userData?.username) as {name: string};
    const finalData = {...userName, ...userData};
    
    return res.status(200).json({finalData});
})

export default router; 