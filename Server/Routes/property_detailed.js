import express from "express";
import db from "../database/database.js";

const router = express.Router(); 

router.get("/:id", (req, res) => {
    const id = req.params.id; 
    const results = db.prepare(`
        SELECT property_list.*, property_photos.photo_path
        FROM property_list 
        LEFT JOIN property_photos
        ON property_photos.property_id = property_list.id
        WHERE property_list.id = ?`).all(id); 

    const {photo_path, ...propertyData} = results[0];
    const data = {...propertyData,
        photos: results
            .map(result => result.photo_path)
            .filter(Boolean)
    }; 


    res.status(200).json(data);

})

export default router;
