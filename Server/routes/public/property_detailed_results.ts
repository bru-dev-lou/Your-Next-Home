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
    date_listed: string;
    detail: string;
    photo_path: string; 
};

const router = express.Router(); 

router.get("/:propID", (req, res) => {
    const propID = req.params.propID; 

    try { 
        const propertyDetails = db.prepare(`
            SELECT property_list.id, 
            property_list.type,
            property_list.city,
            property_list.price, 
            property_list.no_bedrooms,
            property_list.no_bathrooms, 
            property_list.size,
            property_list.furniture,
            property_list.date_listed,
            property_list.detail,
            property_photos.photo_path
            FROM property_list 
            LEFT JOIN property_photos
            ON property_photos.property_id = property_list.id
            WHERE property_list.id = ?`).all(propID) as PropertyInfo[];
        
        if (propertyDetails.length === 0) {
            return res.status(404).json({error: `Property with ID ${propID} does not exist.`})
        }

        const {photo_path, ...propertyData} = propertyDetails[0];

        const propData = {...propertyData,
            photos: propertyDetails
                .map(detail => detail.photo_path)
                .filter(Boolean)
        }; 
        
        const ownerDetails = db.prepare(`
            SELECT property_owners.name, property_owners.address, property_owners.phone_number
            FROM property_owners
            INNER JOIN property_list
            ON property_owners.id = property_list.owner_id
            WHERE property_list.id = ?`).get(propID);
        
        if (!ownerDetails) {
            return res.status(404).json({error: `Owner details for property PROP${propID} are missing. The page cannot be loaded.`})
        }

        res.status(200).json({propertyData: propData, ownerData: ownerDetails});
    }
    
    catch(error) {
        res.status(500).json({error: "Server Error: The team has been notified."});
        console.log(`Error retrieving data for property ${propID}: `, error); 
    }
})

export default router;
