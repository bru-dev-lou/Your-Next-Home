import express from 'express';
import db from "../database/database.js";

const router = express.Router();

// This route is for editing a property. It expects the property ID, owner ID, and the new details of the property in the request body.