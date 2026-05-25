import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    const userData = req.user;

    return res.status(200).json({userData});
})

export default router; 