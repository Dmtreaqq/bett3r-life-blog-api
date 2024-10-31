import jwt, {JwtPayload} from 'jsonwebtoken'
import {CONFIG} from "../utils/config";

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

    // TODO переписать на декод
    decodeToken(token: string) {
        return jwt.decode(token, { json: true })
    }
}

