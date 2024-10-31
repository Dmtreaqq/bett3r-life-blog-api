import {sessionsRepository} from "./sessionsRepository";
import {SessionDbModel} from "./models/SessionDbModel";
import {jwtAuthService} from "../../../common/services/jwtService";
import {ApiError} from "../../../common/utils/ApiError";
import {HTTP_STATUSES} from "../../../common/utils/types";


export const sessionsService = {
    async createSession(refreshToken: string, ip = 'Unknown IP', userAgent = 'Unknown Device') {
        const token = jwtAuthService.decodeToken(refreshToken)

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
        const { iat: oldIat, deviceId } = jwtAuthService.decodeToken(oldRefreshToken)
        const { iat: newIat, exp } = jwtAuthService.decodeToken(newRefreshToken)

        await sessionsRepository.updateSession(deviceId, oldIat!, newIat!, exp!)
    },

    async isActiveSession(refreshToken: string): Promise<SessionDbModel | null> {
        const { iat, deviceId } = jwtAuthService.decodeToken(refreshToken)
        const result = await sessionsRepository.isActiveSession(deviceId, iat!)
        if (!result) {
           return null
        }

        return result
    },

    async deleteSession(refreshToken: string, passedDeviceId: string) {
        const { iat, id: userId } = jwtAuthService.decodeToken(refreshToken)

        const userSession = await sessionsRepository.getSessionByDeviceId(passedDeviceId)

        if (!userSession) {
            throw new ApiError(HTTP_STATUSES.NOT_FOUND_404, 'No Session By Device Id')
        }

        if (userSession.userId !== userId) {
            throw new ApiError(HTTP_STATUSES.FORBIDDEN_403)
        }

        const result = await sessionsRepository.deleteSession(passedDeviceId, iat!)

        return result
    }
}