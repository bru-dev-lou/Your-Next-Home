import express from "express";
import db from "../database/database.js"

const router = express.Router();

router.post("/", (req, res) => {
    const [name, address, number, email, password] = req.body; 
    if (!name || !address || !number || !email || !password) {
        res.status(400).json( {error: "All fields required!"} );
    }

    console.log("All information submitted");

    const result = db.prepare(`INSERT INTO property_owners (name, address, phone_number, email, password_hash) VALUES (?, ?, ?, ?, ?)`)
    .run(name, address, number, email, password);

    console.log("Account created:", result);
    res.status(200).json( {message: "Accounnt created!" });

}) 


export default router; 