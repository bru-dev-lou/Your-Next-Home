import express from "express";
import db from "../database/database.js";

const router = express.Router();

router.get("/:username/:id", (req, res) => {
    const username = req.params.username;
    const id = req.params.id;

    const user = db.prepare(`SELECT * FROM property_owners WHERE username = ? AND id = ?`).get(username, id);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

    const properties = db.prepare(`SELECT * FROM properties WHERE owner_id = ?`).all(id);

    if (!properties) {
        return res.status(404).json({ error: "You don't have any properties listed." });
    }

    res.status(200).json({ user, properties });
});

export default router;