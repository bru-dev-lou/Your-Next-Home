import express from 'express';
import db from "../database/database.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

router.route("/:username/:propID")

.get((req, res) => {
    const {propID, username} = req.params;

    try {
        const user = db.prepare(`SELECT id FROM property_owners WHERE username = ?`).get(username);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const SQLShow = db.prepare(`SELECT * FROM property_list WHERE owner_id = ? AND id = ?`).get(user.id, propID);
        
        if (SQLShow.length === 0) {
            return res.status(404).json({ error: "Property not found." });
        }

        const SQLPhotos = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
        
        if (SQLPhotos.length === 0) {
            return res.status(404).json({ error: "No photos found for this property." });
        }

        res.status(200).json({ property: SQLShow, photos: SQLPhotos });
        
    }

    catch (error) {
        console.error("Error fetching property:", error);
        return res.status(500).json({ error: "An error occurred while fetching the property." });
    }
})

.patch ((req, res) => {
    const {propID, username} = req.params;
    const {type, city, price, bedrooms, bathrooms, size, furniture, summary, details} = req.body;
    
    try {
        const user = db.prepare(`SELECT id FROM property_owners WHERE username = ?`).get(username);
        
        if (!user) {
        return res.status(404).json({ error: "User not found." });
        }

        const SQLEdit = db.prepare(`UPDATE property_list 
            SET type = ?, city = ?, price = ?, no_bedrooms = ?, no_bathrooms = ?, size = ?, furniture = ?, summary = ?, details = ? WHERE id = ? AND owner_id = ?`)
            .run(type, city, price, bedrooms, bathrooms, size, furniture, summary, details, propID, user.id);

        if (SQLEdit.changes > 0) {
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

.delete((req, res) => {
    const {propID, username} = req.params;
    const {photoID, photo_path} = req.body;
    
    try {
        const user = db.prepare(`SELECT id from property_owners WHERE username = ?`).get(username); 

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const SQLDeletePhotos = db.prepare(`DELETE FROM property_photos WHERE id = ? AND property_id = ? AND photo_path = ?`).run(photoID, propID, photo_path);

        if (SQLDeletePhotos.changes > 0) {
            return res.status(200).json({ message: "Photo deleted successfully!" });
        }
    }
    
    catch (error) {
        console.error("Error deleting property:", error);
        return res.status(500).json({ error: "An error occurred while deleting the property." });
        }

})

.post (upload.array('photos', 10), (req, res) => {
    const {propID, username} = req.params;

    try {
        const user = db.prepare(`SELECT id from property_owners WHERE username = ?`).get(username);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No photos uploaded." });
        }

        const SQLAddPhoto = db.prepare(`INSERT INTO property_photos (property_id, photo_path) VALUES (?, ?)`);

        for (const file of req.files) {
            SQLAddPhoto.run(propID, file.path);
        }

        return res.status(201).json({ message: "Photos added successfully!" });
    }

    catch (error) {
        console.error("Error adding photo:", error);
        return res.status(500).json({ error: "An error occurred while adding the photo." });
    }

})


export default router;