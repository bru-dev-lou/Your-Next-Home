import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database("./database/database.db");

router.get("/", (req,res) => {
    const defaultCity = "";
    // Keep defaultCity for later when featured properties are implemented. 

    const defaultMinPrice = 0;
    const defaultMaxPrice = 1000000000;

    const city = req.query.city || defaultCity;
    const minPrice = Number(req.query.minPrice) || defaultMinPrice; 
    const maxPrice = Number(req.query.maxPrice) || defaultMaxPrice;

    const data = db.prepare("SELECT * FROM property_list WHERE city LIKE ? AND price >= ? AND price <= ?").all(`%${city}%`, minPrice, maxPrice);

    res.status(200).json(data);
    
});


export default router;  