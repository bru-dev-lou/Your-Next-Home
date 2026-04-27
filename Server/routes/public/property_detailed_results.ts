import express from "express";
import db from "../../database/database.js";

type PropertyInfo = {
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
    photo_path: string; 
};

const router = express.Router(); 

router.get("/:id", (req, res) => {
    const id = req.params.id; 
    const results = db.prepare(`
        SELECT property_list.*, property_photos.photo_path
        FROM property_list 
        LEFT JOIN property_photos
        ON property_photos.property_id = property_list.id
        WHERE property_list.id = ?`).all(id) as PropertyInfo[];

    const {photo_path, ...propertyData} = results[0];
    const data = {...propertyData,
        photos: results
            .map(result => result.photo_path)
            .filter(Boolean)
    }; 


    res.status(200).json(data);

})

export default router;
