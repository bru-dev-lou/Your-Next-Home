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

    //  Name validation  

    const nameHasLetters = /\p{L}/u.test(name);
    const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(name);

    if (name.length < 5 || name.length > 25 ) {
        return res.status(400).json({error: "Please include a name between 5 and 25 characters long."})
    }

    if (!nameHasLetters || !nameIsValidFormat) {
        return res.status(400).json({error: "Please include a name with no numbers."})
    }

    // Email validation 

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
        return res.status(400).json({ error: "Please include a valid email address."})
    }

    if (email.length > 50) {
        return res.status(400).json({ error: "Email should be less than 50 characters."})
    }

/*  
    For the next two if statements, do not change the error messages. 
    Changing these will affect aria-invalid for the relevant fields in the frontend. 
*/        

    if (messageTopic.split(/\s+/).filter(Boolean).length < 5 || messageTopic.split(/\s+/).filter(Boolean).length > 25 ) {
        return res.status(400).json({ error: "Topic should be between 5 and 25 words long." });
    }

    if (message.split(/\s+/).filter(Boolean).length < 25 || message.split(/\s+/).filter(Boolean).length > 250) {
        return res.status(400).json({ error: "Message should be between 25 and 250 words long." });
    }

    //  PROPID validation and fallback value 
    
    if (!propID) {
        propID =  "PROP0000";
    }

    const validPropID = /^[a-zA-Z0-9]+$/.test(propID);

    if (propID.length > 11 || !validPropID) {
        return res.status(400).json({error: "Invalid Prop ID."})
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
        res.status(500).json({server_error: "Server Error: The team has been notified."});
    }
})

export default router;