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

router.post("/:ownerID", (req, res) => {
    const ownerID = req.params.ownerID;
    const propID = req.body.propID;

    if (!ownerID) {
        return res.status(401).json({error:"Please log in to use this feature."});
    }

    try {
        const SQL = "INSERT INTO property_favorites (owner_id, property_id) VALUES (?, ?)";
        const addFavProperty = db.prepare(SQL).run(ownerID, propID); 

        if(addFavProperty.changes === 0) {
            console.log("Insert returned 0 changes", {ownerID, propID});
            return res.status(500).json({error: "Server Error: The team has been notified."});
        }
        
        else {
            return res.status(201).json({message: "Property added to favorites."});
        }
    }

    catch(error) {
        console.log(error)
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

router.delete("/:ownerID", (req, res) => {
    const ownerID = req.params.ownerID;
    const propID = req.body.propID;

    if (!ownerID) {
        return res.status(401).json({error:"Please log in to use this feature."})
    }

    try {
        const SQL = "DELETE FROM property_favorites WHERE owner_id = ? AND property_id = ?";
        const removeFavProperty = db.prepare(SQL).run(ownerID, propID);

        if (removeFavProperty.changes === 0) {
            console.log("Delete returned 0 changes", {ownerID, propID});
            return res.status(500).json({error: "Server Error: The team has been notified."});
        }

        else {
            return res.status(204).send();
        }
    }

    catch (error) {
        console.log(error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

export default router;  