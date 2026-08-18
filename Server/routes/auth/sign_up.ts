import express from "express";
import bcrypt from "bcrypt";
import db from "../../database/database.js"

const router = express.Router();

router.post("/", async (req, res) => {
    const username = req.body.username?.trim();
    const name = req.body.name;
    const address = req.body.address?.trim();
    const number = req.body.number?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const confirmPass = req.body.confirmPass;

    // Empty field check

    const blankFieldCheck = [
        {name: "username", field: username, error:"Please choose a username."},
        {name: "name", field: name, error: "Please provide your name / company's name."},
        {name: "address", field: address, error: "Please provide your address / company's address."},
        {name: "phone_number", field: number, error: "Please provide your phone number / company's phone number."},
        {name: "email", field: email, error: "Please provide your email address."},
        {name: "password", field: password, error: "Please choose a password."},
        {name: "confirm_password", field: confirmPass, error: "Please confirm your chosen password."}
    ];

    for (const {name, field, error} of blankFieldCheck) {
        if(!field) {
            return res.status(400).json({name, error});
        }
    } 

    // Username validation 

    if (username.length < 5 || username.length >= 20) {
        return res.status(400).json({error: "Username must be between 5 and 20 characters."})
    }

    // Name validation 

    if (name.length < 5 || name.length >= 50) {
        return res.status(400).json({ error: "Name must be between 5 and 50 characters." })
    }

    const nameHasLetters = /\p{L}/u.test(name);
    const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(name);

    if (!nameHasLetters || !nameIsValidFormat) {
        return res.status(400).json({error: "Please include a name with no numbers."})
    }

    // Address validation 

    if (address.split(/\s+/).filter(Boolean).length < 5) {
        return res.status(400).json({error: "Address must be longer than 5 words."})
    }

    // Phone number validation 

    const validNumber = /^[0-9]{10,}$/.test(number);
    
    if (!validNumber) {
        return res.status(400).json({ error: "Please ensure your phone number is at least 10 digits long with no spaces or symbols."})
    }

    // Email validation 

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
        return res.status(400).json({ error: "Please include a valid email address."})
    }
    
    
    /* For the next two if statements, do not change the error messages. 
    Changing these will affect aria-invalid for the relevant fields in the frontend. */ 

    
    if (confirmPass !== password) {
        return res.status(400).json({error: "Passwords must match."}); 
    }    

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."
        });
    }

    try {
        const existingFieldCheck = [
            {column: "username", value: username, error: "This username is unavailable. Please choose another one."},
            {column: "address", value: address, error: "This address is already in use. Please choose another one."},
            {column: "phone_number", value: number, error: "This phone number is already in use. Please choose another one."},
            {column: "email", value: email, error: "This email is already in use. Please choose another one."}
        ];

        for (const {column, value, error} of existingFieldCheck){
            const exists = db.prepare(`SELECT 1 FROM property_owners WHERE ${column} = ?`).get(value); 
            if(exists){
                return res.status(400).json({column, error});
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        db.prepare(`INSERT INTO property_owners (username, name, address, phone_number, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(username, name, address, number, email, passwordHash);

        res.status(201).json({ message: "Your account has been created!"});
    }

    catch(error) {
        console.log("Error creating a new account: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }

}) 


export default router; 