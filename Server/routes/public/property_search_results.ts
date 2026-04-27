import express from "express";
import db from "../../database/database.js";

const router = express.Router();

router.get("/", (req,res) => {
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

    console.log({ city, type, maxPrice, minBeds, minBaths, furniture });

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
            `)
            .all(
                `%${city}%`, 
                `%${type}%`, 
                maxPrice, 
                minBeds, 
                minBaths, 
                `%${furniture}%`
            ); 
            
            return res.status(200).json(data);
            
});

export default router;  

