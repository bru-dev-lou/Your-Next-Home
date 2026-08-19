import bcrypt from "bcrypt";
import express from 'express';
import db from "../../database/database.js";

type UserData = {
    password_hash: string,
}

const router = express.Router();

router.route("/")

.get((req, res) => {
    const ownerID = req.user?.id;

    try {                
        const userData = db.prepare(`SELECT name, address, phone_number, email FROM property_owners WHERE id = ?`).get(ownerID);

        if (!userData) {
            return res.status(404).json({ noUserError: "User data not found." });
        }   

        res.status(200).json({userData});
    }

    catch (error) {
        console.error("Error while retrieving user's data: ", error);
        return res.status(500).json({error: "Server Error: The team has been notified."})
    }


})

.patch(async (req, res) => {
    const ownerID = req.user?.id;

    const name = req.body.userPublicDetails.name;
    const address = req.body.userPublicDetails.address?.trim();
    const number = req.body.userPublicDetails.phone_number;
    const email = req.body.userPublicDetails.email?.trim().toLowerCase();
    const password = req.body.userPublicDetails.password?.trim();

    const fieldCheck = [
        {field: name, name: "name", error: "Please provide your name to update your profile."},
        {field: address, name: "address", error: "Please provide your address to update your profile."},
        {field: number, name: "number", error: "Please provide your phone number to update your profile."},
        {field: email, name: "email", error: "Please provide your email to update your profile."}
    ];

    for (const {field, name, error} of fieldCheck) {
        if (!field) {
            return res.status(400).json ({name, error}); 
        }
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
        
    // Password check 

    if (!password) {
        return res.status(400).json({name: "missing_password", passwordError: "Please provide your password to confirm these changes."})
    }

    try {        
        const user  = db.prepare(`SELECT password_hash FROM property_owners WHERE id = ?`).get(ownerID) as UserData;

        const match = await bcrypt.compare(password, user.password_hash);
    
        if (!match) {
            return res.status(400).json({name: "incorrect_password", passwordError: "Incorrect password, please try again."});
        }

        const SQLPublic = "UPDATE property_owners SET name = ?, address = ?, phone_number = ?, email = ? WHERE id = ?";
        
        db.prepare(SQLPublic).run(name, address, number, email, ownerID); 
        
        res.status(200).json({ message: "Your profile has been updated." });
    }           

    catch(error) {
        console.log("Error while updating user data: ", error);
        return res.status(500).json({error: "Server Error: The team has been notified."});
    }    
})

.delete(async (req, res) => {
    const ownerID = req.user?.id;
    const password = req.body.userAccountDeleteDetails.password?.trim();

    // Password check 

    if(!password) {
        return res.status(400).json({name: "missing_password", error: "Please provide your password before deleting your account."})
    }
    
    try {        
        const user = db.prepare(`SELECT password_hash FROM property_owners WHERE id = ?`).get(ownerID) as UserData;

        const match = await bcrypt.compare(password, user.password_hash);

        if(!match) {
            return res.status(400).json({name: "incorrect_password", error: "Incorrect password, please try again."});
        }

        db.prepare(`DELETE FROM property_owners WHERE id = ?`).run(ownerID); 
        
        res.clearCookie("token");
        return res.status(204).send();
        
    }

    catch(error) {
        console.log("Error while deleting user account: ", error);
        return res.status(500).json({error: "Server Error: The team has been notified."});
    }    
})

router.route("/password_change")

.patch(async (req, res) => {
    const ownerID  = req.user?.id;
    const password = req.body.userPrivateDetails.password?.trim();
    const newPassword = req.body.userPrivateDetails.newPassword?.trim();
    const passwordConfirmation = req.body.userPrivateDetails.passwordConfirmation?.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

    
    if (!password) {
        return res.status(400).json({name: "missing_current_pass", error: "Please start by providing your password."})
    }

    if(!newPassword) {
        return res.status(400).json({name: "missing_new_pass", error: "Please choose a new password."});
    }

    if (newPassword !== passwordConfirmation) {
            return res.status(400).json({name: "no_match_passwords", error: "Passwords do not match."})
    }
        
    if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({name: "new_pass_wrong_format", error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."});
    }
    
    if (newPassword === password) {
        return res.status(400).json({name: "new_pass_same_old_pass", error: "New password cannot be the same as old password."});
    }

    try {    
        const user = db.prepare(`SELECT password_hash FROM property_owners WHERE id = ?`).get(ownerID) as UserData; 
        
        const match = await bcrypt.compare(password, user.password_hash);
    
        if (!match) {
            return res.status(400).json({name: "incorrect_current_pass", error: "Incorrect password, please try again."});
        }
           
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const SQLPrivate = "UPDATE property_owners SET password_hash = ? WHERE id = ?";
        
        db.prepare(SQLPrivate).run(newPasswordHash, ownerID); 

        res.status(200).json({message: "Your password has been changed."});
    } 

    catch(error) {
        console.error("Error while changing user's password: ", error);
        return res.status(500).json({error: "Server Error: The team has been notified."});    
    }
})

export default router;