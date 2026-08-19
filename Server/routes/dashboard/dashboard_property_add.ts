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
    const photos = req.files as Express.Multer.File[];
    const { type, city, price, bedrooms, bathrooms, size, furniture, summary, detail } = req.body;
    
    const fieldCheck = [
        { field: city, name:"city", error: "Please state where your property is located." },
        { field: type, name:"type", error: "Please choose a property type." },
        { field: price, name:"price", error: "Please state the property's monthly rental rate." },
        { field: bedrooms, name:"bedrooms", error: "Please state how many bedrooms your property has." },
        { field: bathrooms, name:"bathrooms", error: "Please state how many bathrooms your property has." },
        { field: size, name:"size", error: "Please state the size of your property in m²." },
        { field: furniture, name:"furniture", error: "Please choose your property's type of furnishing." },
        { field: summary, name:"summary", error: "Please provide a summary of your property." },
        { field: detail, name:"detail", error: "Please provide a detailed description of your property." } 
    ];

    for (const {field, name, error} of fieldCheck) {
        if (!field || field === 0) {
            return res.status(400).json ({name, error}); 
        }
    }

    const validCity = /^[a-zA-Z\-]+$/.test(city); 

    if (!validCity) {
        return res.status(400).json({ error: "City name must only include letters and hyphens."})
    }    

    if (summary.split(/\s+/).filter(Boolean).length > 50) {
        return res.status(400).json({ error: "Property summary cannot exceed 50 words." });
    }

    if (detail.split(/\s+/).filter(Boolean).length > 250) {
        return res.status(400).json({ error: "Property description cannot exceed 250 words." });
    }
    
    if (photos.length <= 4) {
        return res.status(400).json({ photosError: `Please upload at least ${5 - photos.length} more ${photos.length === 4 ? "photo" : "photos"}.` });
    }

    try {
        const newPropertyData = db.prepare(`
            INSERT INTO property_list 
            (type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, owner_id, detail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(type, city, price, bedrooms, bathrooms, size, furniture, summary, ownerID, detail)
        ;
        
        const newPropertyPhotos = db.prepare(`
            INSERT INTO property_photos 
            (property_id, photo_path) 
            VALUES (?, ?)`)
        ;

        for (const photo of photos) {
            const result = await new Promise<CloudinaryResult>((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'new_property_photos' }, (error, result) => {
                    if (error || !result) reject(error);
                    else resolve(result);
                }).end(photo.buffer);
            });   
            newPropertyPhotos.run(newPropertyData.lastInsertRowid, result.secure_url);
        }

        db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(newPropertyData.lastInsertRowid);

        res.status(201).json({ message: "*** Listing Created ***", lastInsertRowid: newPropertyData.lastInsertRowid });
    }    

    catch (error) {
        console.error("Error while adding new property: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }

})

export default router; 