import jwt, {JwtPayload} from 'jsonwebtoken'
import {CONFIG} from "../utils/config";
import {ApiError} from "../utils/ApiError";
import {HTTP_STATUSES} from "../utils/types";

const secret = CONFIG.JWT_SECRET

export const jwtAuthService = {
    createAccessToken(user: any): string {
        const token = jwt.sign(user, String(secret), {
            expiresIn: '10s'
        });

        return token;
    },

    createRefreshToken(user: any): string {
        const token = jwt.sign(user, String(secret), {
            expiresIn: '20s'
        });

        return token;
    },

    verifyToken(token: string): string | JwtPayload {
        const result = jwt.verify(token, String(secret))

        return result
    },

    decodeToken(token: string): JwtPayload {
        const decoded = jwt.decode(token, { json: true })

        if (!decoded) {
            throw new Error('Something wrong while decoding token')
        }

        return decoded
    }
}

