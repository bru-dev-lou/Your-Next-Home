import {Request, Response, NextFunction} from "express"; 
import jwt from "jsonwebtoken";

function signedOutAuthentication (req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token; 

    if (!token) {
        return next();
    }

    try {
        const tokenVerification = jwt.verify(token, process.env.JWT_secret!);
        req.user = tokenVerification as {id: number; username: string};
        next();
    }

    catch (error) {
        console.error(error);
        next();
    }
}

export default signedOutAuthentication;