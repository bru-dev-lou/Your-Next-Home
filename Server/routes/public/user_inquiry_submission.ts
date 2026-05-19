import express from "express";
import db from "../../database/database.js";

const router = express.Router(); 

router.post("/", (req, res) => {
    const { name, email, propID, messageTopic, message } = req.body;
    
    const fieldCheck = [
        {field: name, error: "Please include your name."},
        {field: email, error: "Please include your email so we can get back to you."},
        {field: messageTopic, error: "Please include a message topic."},
        {field: message, error: "Please include a description."}
    ]

    for (const{field, error} of fieldCheck) {
        if(!field) {
            return res.status(400).json({error});
        }
    }
    
    try {
        const inquiryFull = "INSERT INTO inquiries (name, email, property_id, message_topic, message) VALUES (?, ?, ?, ?, ?)";
        const inquiryPartial = "INSERT INTO inquiries (name, email, message_topic, message) VALUES (?, ?, ?, ?)";

        if (!propID || propID === "") {
            db.prepare(inquiryPartial).run(name, email, messageTopic, message);
            res.status(201).json({ message: "Inquiry submitted successfully" });
        }

        else {
            db.prepare(inquiryFull).run(name, email, propID, messageTopic, message);
            res.status(201).json({ message: "Inquiry submitted successfully" });
        }
    }

    catch (error) {
        console.log("Error submiting inquiry: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})

export default router;
