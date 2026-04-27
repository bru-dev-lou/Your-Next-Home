import bcrypt from "bcrypt"; 
import express from "express";
import db from "../../database/database.js";

type UserData = {
    id: number; 
    name: string; 
    username: string;
    password_hash: string; 
};

const router = express.Router(); 
const fakeHash = "$2b$10$invalidsaltinvalidsaltinv.u5u5u5u5u5u5u5u5u5u5u5u5u";

router.post("/", async (req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    if (!username || !password) {
        const missing = [];
        if (!username) missing.push("username");
        if (!password) missing.push("password");
        return res.status(400).json({ error: `Please provide your ${missing.join(" and ")}.`});
    }

    const user = db.prepare(`SELECT * FROM property_owners WHERE username = ?`).get(username) as UserData;

    if (!user) {
        await bcrypt.compare(password, fakeHash);
        return res.status(401).json({ error: "Invalid credentials, please try again." });
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
        return res.status(401).json({ error: "Invalid credentials, please try again." });
    }
    
    res.status(200).json({ name: user.name, username: user.username, id: user.id });
}
)

export default router;