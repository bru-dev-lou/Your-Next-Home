import express from 'express';
import db from "../database/database.js";

const router = express.Router();

router.get("/:username/:id", (req, res) => {
    const {id, username} = req.params;

    try {
        const user = db.prepare(`SELECT id FROM property_owners WHERE username = ?`).get(username);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const showProperty = db.prepare(`SELECT property_list.*, property_photos.photo_path
        FROM property_list
        LEFT JOIN property_photos
        ON property_photos.property_id = property_list.id
        WHERE owner_id = ? AND property_list.id = ?
        `)
        .all(user.id, id);     
    
        if (showProperty.length === 0) {
            return res.status(404).json({ error: "Property not found." });
        }
        else {
            res.status(200).json({ property: showProperty });
        }
    }

    catch (error) {
        console.error("Error fetching property:", error);
        return res.status(500).json({ error: "An error occurred while fetching the property." });
    }
})

router.patch("/:username/:id", (req, res) => {
    const { id, username } = req.params;
    const {type, city, price, bedrooms, bathrooms, size, furniture, summary, details} = req.body;

    
    try {
        const user = db.prepare(`SELECT id FROM property_owners WHERE username = ?`).get(username);
        
        if (!user) {
        return res.status(404).json({ error: "User not found." });
        }

        const SQLProperty = db.prepare(`UPDATE property_list 
            SET type = ?, city = ?, price = ?, no_bedrooms = ?, no_bathrooms = ?, size = ?, furniture = ?, summary = ?, details = ? WHERE id = ? AND owner_id = ?`)
            .run(type, city, price, bedrooms, bathrooms, size, furniture, summary, details, id, user.id);

        if (SQLProperty.changes > 0) {
            return res.status(200).json({ message: "Property updated successfully!" });
        }
        else {
            return res.status(404).json({ error: "Please make sure you update at least one field before clicking save." });
        }
    }
    
    catch (error) {
        console.error("Error updating property:", error);
        return res.status(500).json({ error: "An error occurred while updating the property." });
    }
})

export default router;