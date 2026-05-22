import express from "express";
import db from "../../database/database.js";

const router= express.Router();

router.get("/", (req, res) =>{
    const ownerID = req.user?.id;

    try {
        const favoriteProperties = db.prepare("SELECT property_id FROM property_favorites WHERE owner_id = ?").all(ownerID);

        if (favoriteProperties.length == 0){
            res.status(200).json([]);
        }

        else {
            res.status(200).json(favoriteProperties); 
        }
    }

    catch(error){
        console.log("Error retrieving saved favorite properties: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})

router.post("/", (req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;

    try {
        const SQL = "INSERT INTO property_favorites (owner_id, property_id) VALUES (?, ?)";
        const addFavProperty = db.prepare(SQL).run(ownerID, propID); 

        if(addFavProperty.changes === 0) {
            console.log("Insert returned 0 changes", {ownerID, propID});
            return res.status(400).json({error: "Property failed to be added to favorites."});
        }
        
        else {
            return res.status(201).json({message: "Property added to favorites."});
        }
    }

    catch(error) {
        console.log("Error adding property to favorites: ", error)
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

router.delete("/", (req, res) => {
    const ownerID = req.user?.id;
    const propID = req.body.propID;

    try {
        const SQL = "DELETE FROM property_favorites WHERE owner_id = ? AND property_id = ?";
        const removeFavProperty = db.prepare(SQL).run(ownerID, propID);

        if (removeFavProperty.changes === 0) {
            console.log("Delete returned 0 changes", {ownerID, propID});
            return res.status(400).json({error: "Property failed to be removed from favorites."});
        }

        else {
            return res.status(204).send();
        }
    }

    catch (error) {
        console.log("Error removing property from favorites: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."}); 
    }
})

export default router; 