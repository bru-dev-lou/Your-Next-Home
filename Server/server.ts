import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import autoCompleteRouter from "./routes/public/auto_complete_function.js";
import authMiddleware from "./middleware/auth_middleware.js";

import propertySearchResultsRouter from "./routes/public/property_search_results.js";
import detailedPropertyResultsRouter from "./routes/public/property_detailed_results.js";
import inquirySubmissionRouter from "./routes/public/user_inquiry_submission.js";
import signInRouter from "./routes/auth/sign_in.js";
import signUpRouter from "./routes/auth/sign_up.js";
import dashboardMainRouter from "./routes/dashboard/dashboard_main.js";
import dashboardPropertyEditRouter from "./routes/dashboard/dashboard_property_edit.js";
import dashboardPropertyAddRouter from "./routes/dashboard/dashboard_property_add.js";
import dashboardProfileEditRouter from "./routes/dashboard/dashboard_profile_edit.js";
import dashboardPropertyFavorites from "./routes/dashboard/dashboard_property_favorites.js";

import favoritePropertiesRouter from "./routes/protected/favorite_properties.js";

const app = express(); 
const port = 3000;


app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

app.use("/api", autoCompleteRouter);
app.use("/api/search", propertySearchResultsRouter);   
app.use("/api/property", detailedPropertyResultsRouter);
app.use("/api/inquiries", inquirySubmissionRouter);
app.use("/api/signIn", signInRouter);
app.use("/api/signUp", signUpRouter);

app.use("/api/dashboard/", authMiddleware, dashboardMainRouter);
app.use("/api/dashboard/property/edit/", authMiddleware, dashboardPropertyEditRouter);
app.use("/api/dashboard/property/add/", authMiddleware, dashboardPropertyAddRouter);
app.use("/api/dashboard/profile/edit/", authMiddleware, dashboardProfileEditRouter);
app.use("/api/dashboard/property/favorites", authMiddleware, dashboardPropertyFavorites);

app.use("/api/search/favorites", authMiddleware, favoritePropertiesRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});