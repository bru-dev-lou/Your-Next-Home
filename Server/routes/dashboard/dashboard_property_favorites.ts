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
            WHERE property_favorites.owner_id = ?
            ORDER BY property_favorites.date_added DESC`;
    
        const showFavProperties = db.prepare(SQL).all(ownerID);
        
        if (showFavProperties.length === 0) {
            return res.status(400).json({error: "No favorite properties found."})
        }

        else {
            res.status(200).json(showFavProperties);    
        }
    }

    catch(error) {
        console.log(error); 
        res.status(500).json(error);
    }
})

router.delete("/:username/:ownerID/:propID", (req, res) => {
    const {username, ownerID} = req.params;
    const propID = req.body.propID;

    try {
        const user = db.prepare("SELECT username, id from property_owners WHERE username = ? AND id = ? ").get(username, ownerID); 

        if (!user) {
            return res.status(404).json({ error: "User not found. Please make an account first!" });
        }

        if (!propID) {
            return res.status(404).json({error: "No properties found."})
        }

        const SQL = "DELETE from property_favorites WHERE owner_id = ? AND property_id = ?";
        const removeFavProperty = db.prepare(SQL).run(ownerID, propID);

        if(removeFavProperty.changes === 0) {
            return res.status(400).json({error: "An error occurred, the property was not removed."}); 
        }

        else {
            return res.status(204).send(); 
        }
    }

    catch (error) {
        console.log("Server Error: ", error); 
        return res.status(500).json(error);
    }
})

export default router; 