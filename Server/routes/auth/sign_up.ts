import express from "express";
import bcrypt from "bcrypt";
import db from "../../database/database.js"

const router = express.Router();

router.post("/", async (req, res) => {
    const username = req.body.username.trim();
    const name = req.body.name;
    const address = req.body.address.trim();
    const number = req.body.number.trim();
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;
    const confirmPass = req.body.confirmPass;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*]).{8,}$/;
    const passwordHash = await bcrypt.hash(password, 10);


    if (!username || !name || !address || !number || !email || !password) {
        return res.status(400).json( {error: "All fields required!"} );
    }

    const usernameCheck = db.prepare(`SELECT username FROM property_owners WHERE username = ?`).get(username);
    if (usernameCheck) {
        return res.status(400).json({ error: 
            "This username is already in use!"
        });
    }


    const addressCheck = db.prepare(`SELECT address FROM property_owners WHERE address = ?`).get(address);
    if (addressCheck) {
        return res.status(400).json({ error: 
            "This address is already in use!"
        });
    }

    const numberCheck = db.prepare(`SELECT phone_number FROM property_owners WHERE phone_number = ?`).get(number);
    if (numberCheck) {
        return res.status(400).json({ error: 
            "This number is already in use!"
        });
    }

    const emailCheck = db.prepare(`SELECT email FROM property_owners WHERE email = ?`).get(email);
    if (emailCheck) {
        return res.status(400).json({ error: 
            "This email is already in use!"
        });
    }
    
    if (confirmPass !== password) {
        return res.status(400).json( {error: "Passwords must match!"}); 
    }    
    
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "Password must be 8+ characters with an uppercase, a lowercase, a number and a special character [?!@#$%^&*]."
        });
    }


    db.prepare(`INSERT INTO property_owners (username, name, address, phone_number, email, password_hash) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(username, name, address, number, email, passwordHash);

    res.status(200).json({ message: "Accounnt created" });

}) 


export default router; 