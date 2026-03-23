import express from "express";
import db from "../database/database.js";

const router = express.Router(); 

router.use(express.json());

router.post("/", (req, res) => {
    const { name, email, propertyID, messageTopic, message } = req.body;
    
    if (!name || !email || !propertyID || !messageTopic || !message) {
        return res.status(400).json( {error: "All fields are required" } );
    }

    console.log("Contact Inquiry Received:");

    const sql = "INSERT INTO inquiries (name, email, property_id, message_topic, message) VALUES (?, ?, ?, ?, ?)";
    const result = db.prepare(sql).run(name, email, propertyID, messageTopic, message);

    if (result.changes > 0) {
        res.status(201).json({ message: "Inquiry submitted successfully" });
    }
    else {
        res.status(500).json({ error: "Inquiriy submission failed" });
    }
})

export default router;
