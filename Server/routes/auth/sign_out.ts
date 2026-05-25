import express from "express"

const router = express.Router(); 

router.delete("/", (req, res) => {
    const ownerID = req.user?.id; 

    if (!ownerID) {
        return res.status(400).json({error: "You are not signed in."});
    }

    res.clearCookie("token");
    return res.status(204).send(); 
})

export default router; 