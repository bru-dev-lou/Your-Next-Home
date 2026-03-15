import express from 'express';
import propRouter from './Routes/properties.js';
import searchRouter from './Routes/search.js';
const app = express(); 
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/properties", propRouter);
app.use("/search", searchRouter);   

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

