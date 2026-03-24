import express from 'express';
import cors from "cors";
import searchRouter from './routes/search.js';
import citiesRouter from './routes/auto-complete.js';
import inquiriesRouter from './routes/contact-inquiries.js';

const app = express(); 
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/search", searchRouter);   
app.use("/api", citiesRouter);
app.use("/contact", inquiriesRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

