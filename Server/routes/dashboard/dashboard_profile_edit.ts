import bcrypt from "bcrypt";
import express from 'express';
import db from "../../database/database.js";

type Data = {
    password_hash: string,
}

const router = express.Router();

router.route("/")

.get((req, res) => {
    const ownerID = req.user?.id;

    try {
        const userData = db.prepare(`SELECT name, address, phone_number, email FROM property_owners WHERE id = ?`).get(ownerID);

        if (!userData) {
            return res.status(404).json({ error: "User data not found." });
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
    const number = req.body.userPublicDetails.number;
    const email = req.body.userPublicDetails.email?.trim().toLowerCase();
    const password = req.body.userPublicDetails.password?.trim();


    try {
        const fieldCheck = [
            {field: name, error: "Please provide your name to update your profile."},
            {field: address, error: "Please provide your address to update your profile."},
            {field: number, error: "Please provide your phone number to update your profile."},
            {field: email, error: "Please provide your email to update your profile."}
        ];

        for (const {field, error} of fieldCheck) {
            if (!field) {
                return res.status(400).json ({error}); 
            }
        }

        const user  = db.prepare(`SELECT password_hash FROM property_owners WHERE id = ?`).get(ownerID) as Data;

        if (!password) {
            return res.status(400).json({passwordError: "Please provide your password to confirm these changes."})
        }

        const match = await bcrypt.compare(password, user.password_hash);
    
        if (!match) {
            return res.status(400).json({passwordError: "Incorrect password, please try again."});
        }


        const SQLPublic = "UPDATE property_owners SET name = ?, address = ?, phone_number = ?, email = ? WHERE id = ?";
        
        db.prepare(SQLPublic).run(name, address, number, email, ownerID); 
        
        res.status(200).json({ message: "Your account has been updated." });
    }           

    catch(error) {
        console.log("Error while updating user data: ", error);
        return res.status(500).json({error: "Server Error: The team has been notified."});
    }    
})

.delete(async (req, res) => {
    const ownerID = req.user?.id;
    const password = req.body.userAccountDeleteDetails.password?.trim();

    try {
        const user = db.prepare(`SELECT password_hash FROM property_owners WHERE id = ?`).get(ownerID) as Data;

        if(!password) {
            return res.status(400).json({error: "Please provide your password before deleting your account."})
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if(!match) {
            return res.status(400).json({error: "Incorrect password, please try again."});
        }

        db.prepare(`DELETE FROM property_owners WHERE id = ?`).run(ownerID); 
        
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

    try {
        const user = db.prepare(`SELECT password_hash FROM property_owners WHERE id = ?`).get(ownerID) as Data; 

        if (!password) {
            return res.status(400).json({error: "Please start by providing your password."})
        }
        
        const match = await bcrypt.compare(password, user.password_hash);
    
        if (!match) {
            return res.status(400).json({error: "Incorrect password, please try again."});
        }

        if(!newPassword) {
            return res.status(400).json({error: "Please choose a new password."});
        }

        if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."});
            }

        if (newPassword !== passwordConfirmation) {
                return res.status(400).json({error: "Passwords do not match."})
            }
        
        if (newPassword === password) {
            return res.status(400).json({error: "New password cannot be the same as old password."});
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