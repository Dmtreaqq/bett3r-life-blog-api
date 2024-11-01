import { Request, Response, NextFunction } from 'express'
import {jwtAuthService} from "../services/jwtService";
import {HTTP_STATUSES} from "../utils/types";
import {JwtPayload} from "jsonwebtoken";

// @ts-ignore
export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401);

    const token = authHeader.split(' ')[1];

    try {
        const result = jwtAuthService.verifyToken(token) as JwtPayload;
        req.user = result as { id: string };
    } catch (err) {
        console.log(err)
        return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    next();
}
