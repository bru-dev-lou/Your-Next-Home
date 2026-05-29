import bcrypt from "bcrypt"; 
import express from "express";
import db from "../../database/database.js";
import jwt from "jsonwebtoken"; 

type UserData = {
    id: number; 
    username: string;
    name: string; 
    password_hash: string; 
};

const router = express.Router(); 
const fakeHash = "$2b$10$invalidsaltinvalidsaltinv.u5u5u5u5u5u5u5u5u5u5u5u5u";

router.post("/", async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    if (!username || !password) {
        const missing = [];
        if (!username) missing.push("username");
        if (!password) missing.push("password");
        return res.status(400).json({ error: `Please provide your ${missing.join(" and ")}.`});
    }

    try {
        const user = db.prepare(`SELECT id, username, name, password_hash FROM property_owners WHERE username = ?`).get(username) as UserData;

        if (!user) {
            await bcrypt.compare(password, fakeHash);
            return res.status(401).json({ error: "Invalid credentials, please try again." });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ error: "Invalid credentials, please try again." });
        }
    
        const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_secret!, {expiresIn: "7d"});

        res.cookie("token", token,{httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 604800000});

        res.status(200).json({ id: user.id, username: user.username, name: user.name });
    }   

    catch(error){
        console.log("Error with user signing in: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})

export default router;