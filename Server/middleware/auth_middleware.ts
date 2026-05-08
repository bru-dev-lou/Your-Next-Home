import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken"; 

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401). json({ error: "Please sign in first."})
    }

    try {
        const tokenVerification = jwt.verify(token, process.env.JWT_secret!);
        req.user = tokenVerification as {id: number; username: string};
        next();
    }

    catch(err) {
        return res.status(401).json({error: "Your session has expired. Please sign in again."})
    }
}

export default authMiddleware;