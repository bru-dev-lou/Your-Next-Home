import express from 'express';
import db from "../../database/database.js";

import cloudinary from '../../config/cloudinaryConfig.js';
import upload from "../../config/multerConfig.js";

type UserData = {
    id: number;
};

type PropertyData = {
    id: number;
    type: string;
    city: string;
    price: number;
    no_bedrooms: number;
    no_bathrooms: number;
    size: number;
    furniture: string;
    summary: string;
    owner_id: number;
    date_listed: string;
    detail: string;
};

type CloudinaryResult = {
    secure_url: string;
};

const router = express.Router();

router.route("/:username/:ownerID/:propID")

.get((req, res) => {
    const {propID, ownerID, username} = req.params;
    
    console.log("GET hit", username, ownerID, propID);
    try {
        const user = db.prepare(`SELECT id FROM property_owners WHERE username = ?`).get(username) as UserData;

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const SQLShow = db.prepare(`SELECT * FROM property_list WHERE owner_id = ? AND id = ?`).get(user.id, propID) as PropertyData;
        
        if (!SQLShow) {
            return res.status(404).json({ error: "Property not found." });
        }

        const SQLPhotos = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
        
        if (SQLPhotos.length === 0) {
            return res.status(404).json({ error: "No photos found for this property." });
        }

        res.status(200).json({ property: SQLShow, photos: SQLPhotos, ownerID: user.id });
        
    }

    catch (error) {
        console.error("Error fetching property:", error);
        return res.status(500).json({ error: "An error occurred while fetching the property." });
    }
})

.patch ((req, res) => {
    const {propID, username} = req.params;
    const {type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, detail} = req.body;
    
    try {
        const user = db.prepare(`SELECT id FROM property_owners WHERE username = ?`).get(username) as UserData;
        
        if (!user) {
        return res.status(404).json({ error: "User not found." });
        }

        if (summary.split(/\s+/).filter(Boolean).length > 50) {
            return res.status(400).json({ error: "Summary cannot exceed 50 words." });
        }

        if (detail.split(/\s+/).filter(Boolean).length > 250) {
            return res.status(400).json({ error: "Detailed description cannot exceed 250 words." });
        }

        const SQLEdit = db.prepare(`UPDATE property_list 
            SET type = ?, city = ?, price = ?, no_bedrooms = ?, no_bathrooms = ?, size = ?, furniture = ?, summary = ?, detail = ? WHERE id = ? AND owner_id = ?`)
            .run(type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, detail, propID, user.id);
        
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
            db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(propID);
            return res.status(200).json({ message: "Photo deleted successfully!" });
        }

    }
    
    catch (error) {
        console.error("Error deleting property:", error);
        return res.status(500).json({ error: "An error occurred while deleting the property." });
        }

})

.post (upload.array('photos', 10), async (req, res) => {
    const {propID, username} = req.params;
    const files = req.files as Express.Multer.File[]; 

    try {
        const user = db.prepare(`SELECT id from property_owners WHERE username = ?`).get(username);

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No photos have been selected." });
        }

        const SQLAddPhoto = db.prepare(`INSERT INTO property_photos (property_id, photo_path) VALUES (?, ?)`);
        
        for (const file of files) {
            const result = await new Promise<CloudinaryResult>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'new_property_photos' }, (error, result) => {
                    if (error || !result) reject(error);
                    else resolve(result);
                }).end(file.buffer);
            });   
            SQLAddPhoto.run(propID, result.secure_url);
        }

        db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(propID);

        if (files.length > 0) {
            const SQLPhotosUpdated = db.prepare(`SELECT * FROM property_photos WHERE property_id = ?`).all(propID);
            return res.status(201).json({ message: "Photos added successfully!", newPhotos: SQLPhotosUpdated });
        }

        else {
            return res.status(400).json({ error: "Failed to add photos." });
        }
    }

    catch (error) {
        console.error("Error adding photo:", error);
        return res.status(500).json({ error: "An error occurred while adding your photos." });
    }

})


export default router;