import express from 'express';
const router = express.Router();

import Database from "better-sqlite3";
const db = new Database("./database/database.db");


router.get('/cities', async (req, res) => {
const { city } = req.query;
    
    if (!city) 
        return res.json([]);
    
    try { 
        const results = db
        .prepare('SELECT DISTINCT city FROM property_list WHERE city LIKE ? LIMIT 5')
        .all(`%${city}%`);
        
        
        res.json({ cities: results });
    }   
    
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
