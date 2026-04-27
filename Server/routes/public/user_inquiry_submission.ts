import express from "express";
import db from "../../database/database.js";

const router = express.Router(); 

router.post("/", (req, res) => {
    const { name, email, propID, messageTopic, message } = req.body;
    
    if (!name || !email || !messageTopic || !message) {
        return res.status(400).json( {error: "All fields are required" } );
    }
    
    try {
            let result;
            
            if (!propID || propID.trim() === "") {
                result = db.prepare(`INSERT INTO inquiries (name, email, message_topic, message) VALUES (?, ?, ?, ?)`)
                .run(name, email, messageTopic, message);
            }
            
            else { 
                result = db.prepare(`INSERT INTO inquiries (name, email, property_id, message_topic, message) VALUES (?, ?, ?, ?, ?)`)
                .run(name, email, propID, messageTopic, message);
            }
            
            console.log("DB result:", result);
            res.status(201).json({ message: "Inquiry submitted successfully" });

} catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "Database error" });
}
})

export default router;
