import jwt, {JwtPayload} from 'jsonwebtoken'

export const jwtAuthService = {
    createToken(user: any): string {
        const token = jwt.sign(user, 'secret', {
            expiresIn: '10m'
        });

        return token;
    },

    verifyToken(token: string): string | JwtPayload {
        const result = jwt.verify(token, 'secret')

        return result
    }
}

