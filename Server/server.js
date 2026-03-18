import express from 'express';
import propRouter from './routes/properties.js';
import searchRouter from './routes/search.js';
import citiesRouter from './routes/Cities-auto-complete.js';

const app = express(); 
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/properties", propRouter);
app.use("/search", searchRouter);   
app.use("/api", citiesRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

