import express from "express";
import db from "../../database/database.js";

const router = express.Router(); 

router.post("/", (req, res) => {
    const { name, email, messageTopic, message } = req.body;
    let { propID } = req.body;
    
    const fieldCheck = [
        {name: "name", field: name, error: "Please include your name."},
        {name: "email", field: email, error: "Please include your email so we can get back to you."},
        {name: "topic", field: messageTopic, error: "Please include a message topic."},
        {name: "message", field: message, error: "Please include a description."}
    ]

    for (const{name, field, error} of fieldCheck) {
        if(!field) {
            return res.status(400).json({name, error});
        }
    }

/*  
    For the next two if statements, do not change the error messages. 
    Changing these will affect aria-invalid for the relevant fields in the frontend. 
    Will add codes to the error responses in the future to avoid inference based on error message.
*/

    try {
        if (messageTopic.split(/\s+/).filter(Boolean).length > 25) {
            return res.status(400).json({ error: "Please keep your message topic to 25 words or less." });
        }

        if (message.split(/\s+/).filter(Boolean).length > 250) {
            return res.status(400).json({ error: "Please keep your message to 250 words or less." });
        }

        const sendInquiry = `
            INSERT INTO inquiries 
            (name, email, property_id, message_topic, message) 
            VALUES (?, ?, ?, ?)
        `;

        if (!propID) {
            propID =  "PROP0000";
            db.prepare(sendInquiry).run(name, email, propID, messageTopic, message);
            return res.status(201).json({ message: "Inquiry submitted successfully" });
        }
    }

    catch (error) {
        console.log("Error submiting inquiry: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})

export default router;
