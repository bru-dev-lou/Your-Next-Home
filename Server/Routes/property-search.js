import express from "express";
import db from "../database/database.js";

const router = express.Router();

router.get("/", (req,res) => {
    const defaultCity = "";
    // Keep defaultCity for later when featured properties are implemented. 

    const defaultMinBeds = 1;
    const defaultMinBaths = 1;
    const defaultMaxPrice = 1000000000;
    
    const type = req.query.type;
    const city = req.query.city || defaultCity;
    const maxPrice = Number(req.query.maxPrice) || defaultMaxPrice;
    const minBeds = Number(req.query.minBeds) || defaultMinBeds;    
    const minBaths = Number(req.query.minBaths) || defaultMinBaths;
    const size = req.query.size;
    const garden = req.query.garden;   
    const balcony = req.query.balcony; 
    const summary = req.query.summary;
    const dateListed = req.query.dateListed;

    const data = db.prepare("SELECT * FROM property_list WHERE city LIKE ? AND price <= ? AND no_bedrooms >= ? AND no_bathrooms >= ?")
    .all(`%${city}%`, maxPrice, minBeds, minBaths);


    res.status(200).json(data);
    
});


export default router;  

