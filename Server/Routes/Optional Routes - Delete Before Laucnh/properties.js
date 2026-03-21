import express from "express";
import Database from "better-sqlite3";

const router = express.Router();
const db = new Database("./database/database.db");

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const data = db.prepare("SELECT * FROM property_list WHERE id = ?").get(id);  
  res.status(200).json(data);
});

export default router;