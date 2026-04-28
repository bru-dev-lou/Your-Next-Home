import bcrypt from "bcrypt";
import express from 'express';
import db from "../../database/database.js";

type Data = {
    password_hash: string;
};

const router = express.Router();

router.route("/:username/:ownerID")

.get((req, res) => {
    const {username, ownerID} = req.params;
    const userData = db.prepare(`SELECT name, address, phone_number, email FROM property_owners WHERE username = ? AND id = ?`).get(username, ownerID);

    if (!userData) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

    res.status(200).json({userData});
})

.patch(async (req, res) => {
    const { username, ownerID } = req.params; 

    const name = req.body.userPublicDetails.name;
    const address = req.body.userPublicDetails.address?.trim();
    const number = req.body.userPublicDetails.number?.trim();
    const email = req.body.userPublicDetails.email?.trim().toLowerCase();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;
    const password = req.body.userPrivateDetails.password?.trim();
    const newPassword = req.body.userPrivateDetails.newPassword?.trim(); 


    try {
        const userData = db.prepare(`SELECT password_hash FROM property_owners WHERE username = ? AND id = ?`).get(username, ownerID) as Data; 

        if (!userData){
            return res.status(404).json({error: "No user found."});
        }

        if (!password) {
            return res.status(400).json({error: "Please provide your password to confirm these changes."})
        }

        const match = await bcrypt.compare(password, userData.password_hash);
    
        if (!match) {
            return res.status(400).json({error: "Incorrect password, please try again."});
        }

        const SQLPublic = "UPDATE property_owners SET name = ?, address = ?, phone_number = ?, email = ? WHERE username = ? AND id = ?";
        const publicDataUpdate = db.prepare(SQLPublic).run(name, address, number, email, username, ownerID); 
    
        if (publicDataUpdate.changes === 0) {
            return res.status(404).json({error: "No information has been changed. Please edit your required fields."})
        }    

        if (newPassword) {
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."});
            }
           
            const newPasswordHash = await bcrypt.hash(newPassword, 10);
            const SQLPrivate = "UPDATE property_owners SET password_hash = ? WHERE username = ? AND id = ?";
            const privateDataUpdate = db.prepare(SQLPrivate).run(newPasswordHash, username, ownerID); 

            if (privateDataUpdate.changes === 0) {
                return res.status(404).json({error: "An error has occurred with updating your password. Please contact our team."})
            }
        } 

        res.status(200).json({ message: "Your account has been updated." });
    }          

    catch(error) {
        console.log("An error occurred while updating your profile.", error);
        return res.status(500).json({error: "An error occurred while updating your profile"});
    }    
})

.delete(async (req, res) => {
    const {username, ownerID} = req.params;
    const password = req.body.userPrivateDetails.password?.trim();

    try {
        const userData = db.prepare(`SELECT password_hash FROM property_owners WHERE username = ? AND id = ?`).get(username, ownerID) as Data;

        if (!userData){
            return res.status(404).json({error: "No user found"});
        }

        if(!password) {
            return res.status(400).json({error: "Please provide your password before deleting your account."})
        }

        const match = await bcrypt.compare(password, userData.password_hash);

        if(!match) {
            return res.status(400).json({error: "Please provide the correct password before deleting your account."});
        }
        else {
            db.prepare(`DELETE FROM property_owners WHERE username = ? AND id = ?`).run(username, ownerID); 
            return res.status(204).send();
        }
    }

    catch(error) {
        console.log("An error occurred while deleting your account.", error);
        return res.status(500).json({error: "An error occurred while updating your profile"});
    }    
})

export default router;