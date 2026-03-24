import express from 'express';
import db from "../database/database.js";

const router = express.Router();

router.get('/cities', (req, res) => {
const { city } = req.query;
    
    if (!city) 
        return res.json([]);
    
    try { 
        const results = db.prepare('SELECT DISTINCT city FROM property_list WHERE city LIKE ? LIMIT 5').all(`${city}%`);
        
        res.json({ cities: results });
    }   
    
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
