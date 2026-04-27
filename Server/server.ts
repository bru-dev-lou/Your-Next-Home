import "dotenv/config";
import cors from "cors";
import express from "express";

import autoCompleteRouter from "./routes/public/auto_complete_function.js";
import propertySearchResultsRouter from "./routes/public/property_search_results.js";
import detailedPropertyResultsRouter from "./routes/public/property_detailed_results.js";
import inquirySubmissionRouter from "./routes/public/user_inquiry_submission.js";
import signInRouter from "./routes/auth/sign_in.js";
import signUpRouter from "./routes/auth/sign_up.js";
import dashboardMainRouter from "./routes/dashboard/dashboard_main.js";
import dashboardPropertyEditRouter from "./routes/dashboard/dashboard_property_edit.ts";
import dashboardPropertyAddRouter from "./routes/dashboard/dashboard_property_add.js";
import dashboardProfileEditRouter from "./routes/dashboard/dashboard_profile_edit.js";

const app = express(); 
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/api", autoCompleteRouter);
app.use("/api/search", propertySearchResultsRouter);   
app.use("/api/property", detailedPropertyResultsRouter);
app.use("/api/contact", inquirySubmissionRouter);
app.use("/api/signIn", signInRouter);
app.use("/api/register", signUpRouter);
app.use("/api/dashboard/", dashboardMainRouter);
app.use("/api/dashboard/property/edit/", dashboardPropertyEditRouter);
app.use("/api/dashboard/property/add/", dashboardPropertyAddRouter);
app.use("/api/dashboard/profile/edit/", dashboardProfileEditRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

