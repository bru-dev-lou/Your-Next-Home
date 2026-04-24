import express from "express";
import db from "../database/database.js";
import cloudinary from "../config/cloudinaryConfig.js";
import upload from "../config/multerConfig.js"

const router = express.Router(); 

router.route("/:username/:id")

.post (upload.array('photos', 10), async (req, res) => {
    const { type, city, price, bedrooms, bathrooms, size, furniture, summary, detail } = req.body;
    const ownerID = req.params.id;  

    if (!city || city === "") {
        return res.status(400).json({error: "Please state where your property is located."})
    }    
    
    if (!type) {
        return res.status(400).json({ error: "Please choose a property type."})
    }

    if (!price || price == 0) {
        return res.status(400).json({error: "Please state the property's rental rate."})
    }

    if (!bedrooms || bedrooms == 0) { 
        return res.status(400).json({error: "Please choose how many bedrooms your property has."})
    }

    if (!bathrooms || bathrooms == 0) { 
        return res.status(400).json({error: "Please choose how many bathrooms your property has."})
    }

    if (!size || size == 0) {
        return res.status(400).json({error: "Please provide the size of your property."})
    }

    if (!furniture || furniture === "") {
        return res.status(400).json({error: "Please choose your property's type of furnishing."});
        }

    if (!summary){
        return res.status(400).json({ error: "Please provide a summary for your property!"})
    }

    if (summary.split(/\s+/).filter(Boolean).length > 50) {
        return res.status(400).json({ error: "Summary cannot exceed 50 words." });
    }

    if (!detail) {
        return res.status(400).json({ error: "Please provide a detailed description of your property!"})
    }

    if (detail.split(/\s+/).filter(Boolean).length > 250) {
        return res.status(400).json({ error: "Detailed description cannot exceed 250 words." });
    }

    if (req.files.length <= 4) {
        return res.status(400).json({ error: "Please upload at least 5 photos." });
    }

    console.log(ownerID);

    try {
        const newPropertyData = db.prepare(`INSERT INTO property_list (type, city, price, no_bedrooms, no_bathrooms, size, furniture, summary, owner_id, detail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(type, city, price, bedrooms, bathrooms, size, furniture, summary, ownerID, detail);
        
        console.log("Property Data Added:", newPropertyData);

        const newPropertyPhotos = db.prepare(`INSERT INTO property_photos (property_id, photo_path) VALUES (?, ?)`);

        for (const file of req.files) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'new_property_photos' }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }).end(file.buffer);
            });   
            newPropertyPhotos.run(newPropertyData.lastInsertRowid, result.secure_url);
        }

        db.prepare(`UPDATE property_photos SET is_main = 1 WHERE property_id = ? ORDER BY id ASC LIMIT 1`).run(newPropertyData.lastInsertRowid);

        console.log("Property Photos Added:", newPropertyPhotos )
        res.status(201).json({ message: "Your property has been added to our listings!", lastInsertRowid: newPropertyData.lastInsertRowid });
    }    

    catch (errorData) {
        console.error("DB ERROR:", errorData);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }

})



export default router; 