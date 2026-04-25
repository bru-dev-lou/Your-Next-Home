import express from 'express';
import db from "../database/database.js";

const router = express.Router();

router.route("/:username/:id")

.get((req, res) => {
    const {username, id} = req.params;
    const {username, name, address, phone, email, }
    const user = db.prepare(`SELECT * FROM property_owners WHERE username = ? AND id = ?`).get(username, id);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

})

export default router;


