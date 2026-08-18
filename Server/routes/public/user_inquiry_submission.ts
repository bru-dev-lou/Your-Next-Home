import express from "express";
import db from "../../database/database.js";

const router = express.Router(); 

router.post("/", (req, res) => {
    const { name, email, messageTopic, message } = req.body;
    let { propID } = req.body;
    
    // Empty field check 

    const fieldCheck = [
        {name: "name", field: name, error: "Please include your name."},
        {name: "email", field: email, error: "Please include your email so we can get back to you."},
        {name: "topic", field: messageTopic, error: "Please include a message topic."},
        {name: "message", field: message, error: "Please include a message describing your inquiry."}
    ]

    for (const{name, field, error} of fieldCheck) {
        if(!field) {
            return res.status(400).json({name, error});
        }
    }

    //  Name validation check 

    if (name.length < 3 || name.length >= 25 ) {
        return res.status(400).json({error: "Invalid name - Please include a name between 3 and 25 characters long."})
    }

    const nameHasLetters = /\p{L}/u.test(name);
    const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(name);

    if (!nameHasLetters || !nameIsValidFormat) {
        return res.status(400).json({error: "Invalid name - Please include a name with no numbers."})
    }

    // Email validation 

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
        return res.status(400).json({ error: "Please include a valid email address."})
    }

/*  
    For the next two if statements, do not change the error messages. 
    Changing these will affect aria-invalid for the relevant fields in the frontend. 
    Will add codes to the error responses in the future to avoid inference based on error message.
*/        

    if (messageTopic.split(/\s+/).filter(Boolean).length < 5 || messageTopic.split(/\s+/).filter(Boolean).length > 25 ) {
        return res.status(400).json({ error: "Your topic should be between 5 and 25 words long." });
    }

    if (message.split(/\s+/).filter(Boolean).length < 25 || message.split(/\s+/).filter(Boolean).length > 250) {
        return res.status(400).json({ error: "Your message should be between 25 and 250 words long." });
    }

    //  PROPID validation and fallback value 

    if (!propID) {
        propID =  "PROP0000";
    }

    try {
        const sendInquiry = `
            INSERT INTO inquiries 
            (name, email, property_id, message_topic, message) 
            VALUES (?, ?, ?, ?, ?)
        `;

        db.prepare(sendInquiry).run(name, email, propID, messageTopic, message);
        return res.status(201).json({ message: "Inquiry submitted successfully" });
    }

    catch (error) {
        console.log("Error submiting inquiry: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})

export default router;
