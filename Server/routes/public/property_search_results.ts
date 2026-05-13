import express from "express";
import db from "../../database/database.js";

const router = express.Router();


router.get("/", (req, res) => {
    const defaultCity = '';
    const defaultType = '';
    const defaultFurniture = '';
    const defaultMinBeds = 1;
    const defaultMinBaths = 1;
    const defaultMaxPrice = 1000000000;
    
    const type = req.query.type || defaultType;
    const city = req.query.city || defaultCity;
    const maxPrice = Number(req.query.maxPrice) || defaultMaxPrice;
    const minBeds = Number(req.query.minBeds) || defaultMinBeds;    
    const minBaths = Number(req.query.minBaths) || defaultMinBaths;
    const furniture = req.query.furniture || defaultFurniture;


    try {
        const data = db.prepare(`
            SELECT property_list.*, property_photos.photo_path 
            FROM property_list 
            LEFT JOIN property_photos 
            ON property_photos.property_id = property_list.id
            AND property_photos.is_main = 1 
            WHERE city LIKE ? 
            AND type LIKE ? 
            AND price <= ? 
            AND no_bedrooms >= ? 
            AND no_bathrooms >= ? 
            AND furniture LIKE ?
            `).all(
            `%${city}%`, 
            `%${type}%`, 
            maxPrice, 
            minBeds, 
            minBaths, 
            `%${furniture}%`
        ); 
    
        if (data.length === 0) {
            return  res.status(200).json({message: "No properties found matching your search criteria, please try adjusting your fitlers."});
        }

        else {
            return res.status(200).json(data);       
        }
    }
    
    catch(error) {
        console.log(error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})


export default router;  