import express from "express";
import bcrypt from "bcrypt";
import db from "../../database/database.js"

const router = express.Router();

router.post("/", async (req, res) => {
    const username = req.body.username?.trim();
    const name = req.body.name?.trim();
    const address = req.body.address?.trim();
    const number = req.body.number?.trim();
    const email = req.body.email?.trim().toLowerCase(); 
    const password = req.body.password;
    const confirmPass = req.body.confirmPass;

    // Empty field check
    
    const blankFieldCheck = [
        {name: "username", field: username, missingError:"Please choose a username"},
        {name: "name", field: name, missingError: "Please provide your name / company's name"},
        {name: "address", field: address, missingError: "Please provide your address / company's address"},
        {name: "phone_number", field: number, missingError: "Please provide your phone number / company's phone number"},
        {name: "email", field: email, missingError: "Please provide your email address"},
        {name: "password", field: password, missingError: "Please choose a password"},
        {name: "confirm_password", field: confirmPass, missingError: "Please confirm your chosen password"}
    ];

    for (const {name, field, missingError} of blankFieldCheck) {
        if(!field) {
            return res.status(400).json({name, missingError});
        }
    } 

    // Username validation 

    if (username.length < 5 || username.length > 20) {
        return res.status(400).json({validationError: "Username must be between 5 and 20 characters", name: "username"})
    }

    // Name validation 
    
    const nameHasLetters = /\p{L}/u.test(name);
    const nameIsValidFormat = /^[\p{L}\s'-]+$/u.test(name);

    if (!nameHasLetters || !nameIsValidFormat) {
        return res.status(400).json({validationError: "Name must include no special characters", name: "name"})
    }

    if (name.length < 5 || name.length > 40) {
        return res.status(400).json({ validationError: "Name must be between 5 and 40 characters", name: "name"})
    }

    // Address validation 

    if (address.length < 5 || address.length > 40) {
        return res.status(400).json({ validationError: "Address must be between 5 and 40 characters", name: "address"})
    }

    // Phone number validation 

    const validNumber = /^[0-9]+$/.test(number);
    
    if (!validNumber) {
        return res.status(400).json({ validationError: "Phone number must only include numbers", name: "phone_number"})
    }

    if (number.length < 10 || number.length > 20) {
        return res.status(400).json({ validationError: "Phone number must be between 10 and 20 digits", name: "phone_number"});
    }

    // Email validation 
    
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValidEmail) {
        return res.status(400).json({ validationError: "Please include a valid email address.", name: "email"})
    }

    if (email.length > 50) {
        return res.status(400).json({ validationError: "Email must be shorter than 50 characters", name: "email"});
    }
    
    // Password validation 

    if (confirmPass !== password) {
        return res.status(400).json({validationError: "Passwords must match.", name: "confirm_password"}); 
    }    

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({validationError: "Incorrect password format", name: "password"});
    }

    try {
        const existingFieldCheck = [
            {name: "username", value: username, existingError: "Username unavailable. Please choose another one."},
            {name: "address", value: address, existingError: "Address already in use. Please choose another one."},
            {name: "phone_number", value: number, existingError: "Phone number already in use. Please choose another one."},
            {name: "email", value: email, existingError: "Email already in use. Please choose another one."}
        ];

        for (const {name, value, existingError} of existingFieldCheck){
            const exists = db.prepare(`SELECT 1 FROM property_owners WHERE ${name} = ?`).get(value); 
            if(exists){
                return res.status(400).json({name, existingError});
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);

        db.prepare(`INSERT INTO property_owners (username, name, address, phone_number, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(username, name, address, number, email, passwordHash);

        res.status(201).json({ message: "Your account has been created!"});
    }

    catch(error) {
        console.log("Error creating a new account: ", error);
        res.status(500).json({serverError: "Server Error: The team has been notified."}); 
    }

}) 


export default router; 