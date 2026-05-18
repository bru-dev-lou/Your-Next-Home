import express from "express";
import db from "../../database/database.js";

type PropertyInfo = {
    propID: number;
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

router.get("/:propID", (req, res) => {
    const propID = req.params.propID; 

    try { 
        const propertyDetails = db.prepare(`
            SELECT property_list.*, property_photos.photo_path
            FROM property_list 
            LEFT JOIN property_photos
            ON property_photos.property_id = property_list.id
            WHERE property_list.id = ?`).all(propID) as PropertyInfo[];

        const {photo_path, ...propertyData} = propertyDetails[0];

        const data = {...propertyData,
            photos: propertyDetails
                .map(detail => detail.photo_path)
                .filter(Boolean)
        }; 
        
        res.status(200).json(data);
    }
    catch(error) {
        res.status(500).json({error: "Server Error: The team has been notified."});
        console.log(`Error retrieving data for property ${propID}: `, error); 
    }
})

export default router;
