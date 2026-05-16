import express from "express";
import db from "../../database/database.js";

import cloudinary from "../../config/cloudinaryConfig.js";
import upload from "../../config/multerConfig.js";

type CloudinaryResult = {
    secure_url: string;
};

const router = express.Router(); 

router.route("/")

.post (upload.array('photos', 10), async (req, res) => {
    const ownerID = req.user?.id;   
    const files = req.files as Express.Multer.File[];
    const { type, city, price, bedrooms, bathrooms, size, furniture, summary, detail } = req.body;
    
    try {
        const fieldCheck = [
            { field: city, error: "Please state where your property is located." },
            { field: type, error: "Please choose a property type." },
            { field: price, error: "Please state the property's monthly rental rate." },
            { field: bedrooms, error: "Please state how many bedrooms your property has." },
            { field: bathrooms, error: "Please state how many bathrooms your property has." },
            { field: size, error: "Please state the size of your property in m²." },
            { field: furniture, error: "Please choose your property's type of furnishing." },
            { field: summary, error: "Please provide a summary of your property." },
            { field: detail, error: "Please provide a detailed description of your property." } 
        ];

        for (const {field, error} of fieldCheck) {
            if (!field) {
                return res.status(400).json ({error}); 
            }
        }

        if (summary.split(/\s+/).filter(Boolean).length > 50) {
            return res.status(400).json({ error: "Summary cannot exceed 50 words." });
        }

        if (detail.split(/\s+/).filter(Boolean).length > 250) {
            return res.status(400).json({ error: "Detailed description cannot exceed 250 words." });
        }

        if (files.length <= 4) {
            return res.status(400).json({ error: "Please upload at least 5 photos." });
        }

        const newPropertyData = db.prepare(`INSERT INTO property_list (type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, owner_id, detail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(type, city, price, bedrooms, bathrooms, size, furniture, summary, ownerID, detail);
        

        const newPropertyPhotos = db.prepare(`INSERT INTO property_photos (property_id, photo_path) VALUES (?, ?)`);

        for (const file of files) {
            const result = await new Promise<CloudinaryResult>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'new_property_photos' }, (error, result) => {
                    if (error || !result) reject(error);
                    else resolve(result);
                }).end(file.buffer);
            });   
            newPropertyPhotos.run(newPropertyData.lastInsertRowid, result.secure_url);
        }

        db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(newPropertyData.lastInsertRowid);

        res.status(201).json({ message: "Your property has been added to our listings!", lastInsertRowid: newPropertyData.lastInsertRowid });
    }    

    catch (error) {
        console.error("Error while adding new property: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }

})

export default router; 