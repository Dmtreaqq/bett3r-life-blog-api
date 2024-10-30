import {sessionsRepository} from "./sessionsRepository";
import {SessionDbModel} from "./models/SessionDbModel";
import {JwtPayload} from "jsonwebtoken";
import {jwtAuthService} from "../../../common/services/jwtService";
import {ApiError} from "../../../common/utils/ApiError";
import {HTTP_STATUSES} from "../../../common/utils/types";

export const sessionsService = {
    async createSession(refreshToken: string, ip = 'Unknown IP', userAgent = 'Unknown Device') {
        let token;
        try {
            token = jwtAuthService.verifyToken(refreshToken) as JwtPayload
        } catch (err) {
            console.log(err)
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'Unknown Error')
        }

        const session: SessionDbModel = {
            deviceId: token.deviceId,
            issuedAt: token.iat!,
            expirationDate: token.exp!,
            userId: token.id,
            deviceName: userAgent,
            ip
        }

        await sessionsRepository.createSession(session)
    },

    async updateSession(oldRefreshToken: string, newRefreshToken: string) {
        try {
            const { iat: oldIat, deviceId } = jwtAuthService.verifyToken(oldRefreshToken) as JwtPayload
            const { iat: newIat, exp } = jwtAuthService.verifyToken(newRefreshToken) as JwtPayload

            await sessionsRepository.updateSession(deviceId, oldIat!, newIat!, exp!)
        } catch (err) {
            console.log(err)
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'Unknown Error')
        }
    },

    async isActiveSession(refreshToken: string): Promise<boolean> {
        try {
            const { iat, deviceId } = jwtAuthService.verifyToken(refreshToken) as JwtPayload
            const result = await sessionsRepository.isActiveSession(deviceId, iat!)
            if (!result) {
                return false
            }

            return true
        } catch (err) {
            console.log(err);
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'Unknown error while check isActiveSession')
        }
    },

    async deleteSession(refreshToken: string) {
        try {
            const { iat, deviceId } = jwtAuthService.verifyToken(refreshToken) as JwtPayload
            const result = await sessionsRepository.deleteSession(deviceId, iat!)

            return result

        } catch (err) {
            console.log(err);
            throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, 'Unknown error while delete session')
        }
    }
}