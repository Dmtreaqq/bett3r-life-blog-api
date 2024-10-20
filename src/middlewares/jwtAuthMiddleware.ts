import { Request, Response, NextFunction } from 'express'
import {jwtAuthService} from "../services/jwtService";

// @ts-ignore
export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];

    try {
        const result = jwtAuthService.verifyToken(token);
        req.user = result;
    } catch (err) {
        console.log(err)
        return res.sendStatus(401);
    }

    next();
}
