import express from "express";
import db from "../../database/database.ts";

const router =  express.Router(); 

router.get("/:username/:ownerID", (req, res) => {
    const { username, ownerID } = req.params;

    try {
        const user = db.prepare("SELECT id, username FROM property_owners WHERE username = ? AND id = ?").get(username, ownerID);

        if (!user) {
            return res.status(404).json({ error: "User not found. Please make an account first!" });
        }

        const SQL = `SELECT property_favorites.*, property_list.*, property_photos.photo_path
            FROM property_favorites
            INNER JOIN property_list
            ON property_favorites.property_id = property_list.id
            INNER JOIN property_photos
            ON property_favorites.property_id = property_photos.property_id 
            AND property_photos.is_main = 1
            WHERE property_favorites.owner_id = ?`;
    
        const showFavProperties = db.prepare(SQL).all(ownerID);
        
        if (showFavProperties.length === 0) {
            return res.status(400).json({error: "You have not saved any properties to your favorites folder."})
        }

        else {
            res.status(200).json(showFavProperties);    
        }
    }

    catch(error) {
        res.status(500).json(error);
        console.log(error); 
    }
})

router.delete("/:ownerID/:propID", (req, res) => {
    
})

export default router; 