import 'dotenv/config';
import express from 'express';
import cors from "cors";
import autoCompleteRouter from './routes/auto_complete.js';
import propertySearchRouter from './routes/property_search.js';
import detailedPropertyRouter from './routes/property_detailed.js';
import inquiriesRouter from './routes/contact_inquiries.js';
import signInRouter from './routes/sign_in.js';
import accountCreationRouter from './routes/register_account.js';
import dashboardRouter from './routes/dashboard.js';
import dashboardPropertyEditRouter from './routes/dashboard_property_edit.js';


const app = express(); 
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/api", autoCompleteRouter);
app.use("/api/search", propertySearchRouter);   
app.use("/api/property", detailedPropertyRouter);
app.use("/api/contact", inquiriesRouter);
app.use("/api/signIn", signInRouter);
app.use("/api/register", accountCreationRouter);
app.use("/api/dashboard/", dashboardRouter);
app.use("/api/dashboard/property/edit/", dashboardPropertyEditRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

