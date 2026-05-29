import express from "express";
import db from "../../database/database.js";

const router = express.Router();

type DefaultValues = {
    city: string;
    type: string;
    furniture: string;
    minBeds: number;
    minBaths: number;
    maxPrice: number; 
}

router.get("/", (req, res) => {

    const values : DefaultValues = {
        city: "",
        type: "",
        furniture: "",
        minBeds: 1,
        minBaths: 1,
        maxPrice: 10000
    };
    
    const city = req.query.city || values.city;
    const type = req.query.type || values.type;
    const furniture = req.query.furniture || values.furniture;
    const minBeds = Number(req.query.minBeds) || values.minBeds;    
    const minBaths = Number(req.query.minBaths) || values.minBaths;
    const maxPrice = Number(req.query.maxPrice) || values.maxPrice;

    const options: Record<string, string> = {highestprice: "price DESC", lowestprice: "price ASC", date: "date_listed"};
    let sortBy = req.query.sortBy as string || "date";
    if (!(sortBy in options)) {
        sortBy = "date";
    } 

    try {
        const data = db.prepare(`
            SELECT property_list.id,
            property_list.city,
            property_list.price, 
            property_photos.photo_path,
            property_list.summary,
            property_list.date_listed,
            property_list.type,
            property_list.no_bedrooms,
            property_list.no_bathrooms 
            FROM property_list 
            LEFT JOIN property_photos 
            ON property_photos.property_id = property_list.id
            AND property_photos.is_main = 1 
            WHERE city LIKE ? 
            AND type LIKE ? 
            AND price <= ? 
            AND no_bedrooms >= ? 
            AND no_bathrooms >= ? 
            AND furniture LIKE ?
            ORDER BY ${options[sortBy]}
            `).all(
            `%${city}%`, 
            `%${type}%`, 
            maxPrice, 
            minBeds, 
            minBaths, 
            `%${furniture}%`, 
            )
            
        if (data.length === 0) {
            return  res.status(200).json({message: "No properties found matching your search criteria, please try adjusting your fitlers."});
        }

        else {
            return res.status(200).json(data);       
        }
        
    }
    
    catch(error) {
        console.log("Error retrieving properties: ", error);
        res.status(500).json({error: "Server Error: The team has been notified."});
    }
})


export default router;  