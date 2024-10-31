import {sessionsRepository} from "./sessionsRepository";
import {SessionDbModel} from "./models/SessionDbModel";
import {jwtAuthService} from "../../../common/services/jwtService";


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

    async isActiveSession(refreshToken: string): Promise<boolean> {
        const { iat, deviceId } = jwtAuthService.decodeToken(refreshToken)
        const result = await sessionsRepository.isActiveSession(deviceId, iat!)
        if (!result) {
            return false
        }

        return true
    },

    async deleteSession(refreshToken: string) {
        const { iat, deviceId } = jwtAuthService.decodeToken(refreshToken)
        const result = await sessionsRepository.deleteSession(deviceId, iat!)

        return result
    }
}