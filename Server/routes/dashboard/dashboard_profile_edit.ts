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
    const user = db.prepare(`SELECT * FROM property_owners WHERE username = ? AND id = ?`).get(username, ownerID);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

    res.status(200).json({user});
})

.patch(async (req, res) => {
    const { username, ownerID } = req.params; 

    const name = req.body.name;
    const address = req.body.address.trim();
    const number = req.body.number.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password.trim();
    const newPassword = req.body.newPassword.trim(); 

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;

    try {
        const userData = db.prepare(`SELECT password_hash FROM property_owners WHERE username = ? AND id = ?`).get(username, ownerID) as Data; 
        const match = await bcrypt.compare(password, userData.password_hash);
    
        if (!match) {
            return res.status(400).json({error: "Please provide the correct password before making any changes."});
        }

        else {
            if (!passwordRegex.test(newPassword)) {
                return res.status(400).json({ error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."});
            }

            else {
                const newPasswordHash = await bcrypt.hash(newPassword, 10);
                const SQL = "UPDATE property_owners SET name = ?, address = ?, phone_number = ?, email = ?, password_hash = ? WHERE username = ? AND id = ?";
                const dataUpdate = db.prepare(SQL).run(name, address, number, email, newPasswordHash, username, ownerID); 

                if (dataUpdate.changes > 0) {
                    res.status(200).json({message: "Your account has been updated."});
                } 

                else {
                    res.status(404).json({error: "No information has been changed. Please edit your required fields."})
                }
            }
        }
    }

    catch(error) {
        console.log("An error occurred while updating your profile.", error);
        return res.status(500).json({error: "An error occurred while updating your profile"});
    }    
})

.delete(async (req, res) => {
    const {username, ownerID} = req.params;
    const password = req.body.password.trim();

    try {
        const userData = db.prepare(`SELECT password_hash FROM property_owners WHERE username = ? AND id = ?`).get(username, ownerID) as Data;
        const match = await bcrypt.compare(password, userData.password_hash);

        if(!match) {
            return res.status(400).json({error: "Please provide the correct password before deleting your account."});
        }
        else {
            const accountDelete = db.prepare(`DELETE FROM property_owners WHERE username = ? AND id = ?`).run(username, ownerID); 
            return res.status(204).json({message: "Account deleted successfully."});
        }
    }

    catch(error) {
        console.log("An error occurred while deleting your account.", error);
        return res.status(500).json({error: "An error occurred while updating your profile"});
    }    
})

export default router;