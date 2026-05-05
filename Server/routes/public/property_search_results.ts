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
})

router.post("/:ownerID", (req, res) => {
    const ownerID = req.params.ownerID;
    const propID = req.body.propID;

    if (!ownerID) {
        return res.status(400).json({error: "This feature is only available to our users. Please log in."})
    }

    if (!propID) {
        return res.status(404).json({error: "This feature is currently unavailable"})
    }

    try {
        const SQL = "INSERT INTO property_favorites (owner_id, property_id) VALUES (?, ?)";
        const addFavProperty = db.prepare(SQL).run(ownerID, propID); 

        if(addFavProperty.changes === 0) {
            return res.status(400).json({error: "Property failed to be added to favorites." })
        }
        
        else {
            console.log("Property added to favorites.")
            return res.status(201).json({message: "Property added to favorites."});
        }
    }

    catch(error) {
        console.log("Server error:", error)
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

router.delete("/:ownerID", (req, res) => {
    const ownerID = req.params.ownerID;
    const propID = req.body.propID;

    if (!ownerID) {
        return res.status(400).json({error: "This feature is only available to our users. Please log in."})
    }

    if (!propID) {
        return res.status(404).json({error: "This feature is currently unavailable"})
    }

    try {
        const SQL = "DELETE FROM property_favorites WHERE owner_id = ? AND property_id = ?";
        const removeFavProperty = db.prepare(SQL).run(ownerID, propID);

        if (removeFavProperty.changes === 0) {
            return res.status(400).json({error: "Property was not removed from favorites."});
        }

        else {
            return res.status(204).send();
        }
    }

    catch (error) {
        console.log("Server Error:", error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

export default router;  