import express from "express";
import db from "../database/database.js";

const router = express.Router();

router.get("/:username/:id", (req, res) => {
    const { username, id } = req.params;

    const user = db.prepare(`SELECT id, username, name FROM property_owners WHERE id = ? AND username = ?`).get(id, username);

    if (!user) {
        return res.status(404).json({ error: "User not found. Please make an account first!" });
    }

    const properties = db.prepare(`
        SELECT property_list.*, property_photos.photo_path
        FROM property_list
        LEFT JOIN property_photos 
        ON property_photos.property_id = property_list.id 
        AND property_photos.is_main = 1
        WHERE owner_id = ?
        `)
        .all(id);

    if (properties.length === 0) {
        return res.status(404).json({ error: "You don't have any properties listed." });
    }

    res.status(200).json({ user, properties });
});

export default router;