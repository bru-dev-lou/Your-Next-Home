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

    const results = db.prepare(`
        SELECT property_list.*, property_photos.photo_path
        FROM property_list 
        LEFT JOIN property_photos
        ON property_photos.property_id = property_list.id
        WHERE property_list.id = ?`).all(propID) as PropertyInfo[];

    const {photo_path, ...propertyData} = results[0];
    const data = {...propertyData,
        photos: results
            .map(result => result.photo_path)
            .filter(Boolean)
    }; 


    res.status(200).json(data);

})

router.post("/:propID/:ownerID", (req, res) => {
    const {ownerID, propID} = req.params;

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

router.delete("/:propID/:ownerID", (req, res) => {
    const {ownerID, propID} = req.params;

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
