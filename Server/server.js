import express from 'express';
import cors from "cors";
import propertySearchRouter from './routes/property-search.js';
import autoCompleteRouter from './routes/auto-complete.js';
import inquiriesRouter from './routes/contact-inquiries.js';
import detailedPropertyRouter from './routes/property_detailed.js';
import accountCreationRouter from './routes/register_account.js';

const app = express(); 
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/api/search", propertySearchRouter);   
app.use("/api", autoCompleteRouter);
app.use("/api/contact", inquiriesRouter);
app.use("/api/property", detailedPropertyRouter);
app.use ("/api/register", accountCreationRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

