import express from "express";
import db from "../../database/database.js";

const router =  express.Router(); 

router.get("/", (req, res) => {
    const ownerID = req.user?.id;

    try {
        const SQL = `SELECT property_favorites.*, property_list.*, property_photos.photo_path
            FROM property_favorites
            INNER JOIN property_list
            ON property_favorites.property_id = property_list.id
            INNER JOIN property_photos
            ON property_favorites.property_id = property_photos.property_id 
            AND property_photos.is_main = 1
            WHERE property_favorites.owner_id = ?
            ORDER BY property_favorites.date_added DESC`;
    
        const showFavProperties = db.prepare(SQL).all(ownerID);
        
        if (showFavProperties.length === 0) {
            return res.status(404).json({error: "No properties found."})
        }

        else {
            res.status(200).json(showFavProperties);    
        }
    }

    catch(error) {
        console.log("Error while retrieving user's favorite properties: ", error); 
        res.status(500).json({ error: "Server Error: The team has been notified." });
    }
})

router.delete("/:propID", (req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;

    try {
        if (!propID) {
            return res.status(404).json({error: "This property has already been removed."})
        }

        const SQL = "DELETE from property_favorites WHERE owner_id = ? AND property_id = ?";
        const removeFavProperty = db.prepare(SQL).run(ownerID, propID);

        if(removeFavProperty.changes === 0) {
            return res.status(400).json({error: "This property has already been removed."}); 
        }

        else {
            return res.status(204).send(); 
        }
    }

    catch (error) {
        console.log("Error while deleting property: ", error); 
        return res.status(500).json({error: "Server Error: The team has been notified."});
    }
})

export default router; 