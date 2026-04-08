import express from 'express';
import db from "../database/database.js";

const router = express.Router();

router.route("/:username/:id")
.get((req, res) => {
    const username = req.params.username;
    const id = req.params.id;

    const user = db.prepare(`SELECT * FROM property_owners WHERE username = ? AND id = ?`).get(username, id);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }
})

export default router;

// This file is currently not in use, but will be used for the future implementation of the profile editing page.

