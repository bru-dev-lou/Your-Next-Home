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

    const blankFieldCheck = [
        {field: username, error:"Please choose a username."},
        {field: name, error: "Please state your name / company's name."},
        {field: address, error: "Please state your address / company's address."},
        {field: number, error: "Please state your phone number / company's phone number."},
        {field: email, error: "Please state your email address."},
        {field: password, error: "Please choose a password."},
        {field: confirmPass, error: "Please confirm your chosen password."}
    ];

    for (const {field, error} of blankFieldCheck) {
        if(!field) {
            return res.status(400).json({error});
        }
    } 

    try {
        const existingFieldCheck = [
            {column: "username", value: username, error: "This username is already in use. Please choose another one."},
            {column: "address", value: address, error: "This address is already in use. Please choose another one."},
            {column: "phone_number", value: number, error: "This phone number is already in use. Please choose another one."},
            {column: "email", value: email, error: "This email is already in use. Please choose another one."}
        ];

        for (const {column, value, error} of existingFieldCheck){
            const exists = db.prepare(`SELECT 1 FROM property_owners WHERE ${column} = ?`).get(value); 
            if(exists){
                return res.status(400).json({error});
            }
        }

        if (confirmPass !== password) {
            return res.status(400).json( {error: "Passwords must match."}); 
        }    
    
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        db.prepare(`INSERT INTO property_owners (username, name, address, phone_number, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(username, name, address, number, email, passwordHash);

        res.status(201).json({ message: "Thank you, your account has been created!"});
    }

    catch(error) {
        console.log("Error creating a new account: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }

}) 


export default router; 