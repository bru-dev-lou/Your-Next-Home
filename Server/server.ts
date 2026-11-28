import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";


import autoCompleteRouter from "./routes/public/auto_complete_function.js";
import authMiddleware from "./middleware/auth_middleware.js";
import signedOutAuthentication from "./middleware/signed_out_auth_middleware.js";
import userCheck from "./routes/auth/user_check.js";

import propertySearchResultsRouter from "./routes/public/property_search_results.js";
import detailedPropertyResultsRouter from "./routes/public/property_detailed_results.js";
import inquirySubmissionRouter from "./routes/public/user_inquiry_submission.js";
import signInRouter from "./routes/auth/sign_in.js";
import signUpRouter from "./routes/auth/sign_up.js";
import signOutRouter from "./routes/auth/sign_out.js";

import dashboardMainRouter from "./routes/dashboard/dashboard_main.js";
import dashboardPropertyEditRouter from "./routes/dashboard/dashboard_property_edit.js";
import dashboardPropertyAddRouter from "./routes/dashboard/dashboard_property_add.js";
import dashboardProfileEditRouter from "./routes/dashboard/dashboard_profile_edit.js";
import dashboardPropertyFavorites from "./routes/dashboard/dashboard_property_favorites.js";

import favoritePropertiesFeatureRouter from "./routes/protected/favorite_properties_feature.js"; 


const app = express(); 
const port = process.env.PORT || 3000;


app.use(express.json());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server is working!"); 
})

/*  Rate Limit issue found before deployment - Fix below ↓ 

    • maxBody is a temporary workaround for rate limiting property add side until POST requests are split in 2
    • rateLimit will be split into 2 apis in V2 for a better UX

*/

app.set("trust proxy", 1);

const maxBody = 100 * 1024 * 1024; 

const photoUploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 15,
    handler: (req, res) => {
        const contentLength = Number(req.headers["content-length"] ?? 0);

        if (contentLength > maxBody) {
            res.status(429).json({ error: "Too many requests. Please try again later." });
            return;
        }

        req.on("end", () => {
            res.status(429).json({ error: "Too many requests. Please try again later." });
        });
        req.resume();
    },
});

app.post("/api/dashboard/property/add", photoUploadLimiter);
app.post("/api/dashboard/property/edit/:propID", photoUploadLimiter);

app.use("/api", autoCompleteRouter);
app.use("/api/userCheck", signedOutAuthentication, userCheck);

app.use("/api/search", propertySearchResultsRouter);   
app.use("/api/property", detailedPropertyResultsRouter);
app.use("/api/inquiries", inquirySubmissionRouter);
app.use("/api/signIn", signInRouter);
app.use("/api/signUp", signUpRouter);
app.use("/api/signOut", authMiddleware, signOutRouter);

app.use("/api/dashboard", authMiddleware, dashboardMainRouter);
app.use("/api/dashboard/property/edit", authMiddleware, dashboardPropertyEditRouter);
app.use("/api/dashboard/property/add", authMiddleware, dashboardPropertyAddRouter);
app.use("/api/dashboard/profile/edit", authMiddleware, dashboardProfileEditRouter);
app.use("/api/dashboard/property/favorites", authMiddleware, dashboardPropertyFavorites);

app.use("/api/search/favorites", authMiddleware, favoritePropertiesFeatureRouter);

//  Max number of photos + size server side check 

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        let message = "There was a problem uploading your photos.";

        if (err.code === "LIMIT_FILE_SIZE") {
            message = "Each photo must be under 10MB.";
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            message = "You can upload a maximum of 10 photos.";
        }

        return res.status(400).json({ photosError: message, excessiveFile: message });
    }
    next(err);
});

app.listen(port, (error) => {
    if (error) {
        console.error(error);
        process.exit(1);
    }

    console.log(`Server is running on port ${port}`);
    
});