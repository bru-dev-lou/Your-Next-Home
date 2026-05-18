import express from 'express';
import db from "../../database/database.js";

const router = express.Router();

router.get('/cities', (req, res) => {
    const {city} = req.query;

    if (!city) { 
        return res.status(200).json([]);
    }

    try { 
        const autoCompleteResults = db.prepare('SELECT DISTINCT city FROM property_list WHERE city LIKE ? LIMIT 5').all(`${city}%`);
        
        if (autoCompleteResults.length === 0) {
            return res.status(200).json({cities: []});
        }

        res.status(200).json({ cities: autoCompleteResults });
    }   
    
    catch (error) {
        console.log("Error fetching cities for auto complete feature: ", error);
        res.status(500).json({ error: "Server Error: The team has been notified."});
    }
});

export default router;