import {Router, Request, Response} from "express";
import {sessionsRepository} from "../sessions/sessionsRepository";
import {DeviceApiResponseModel} from "./DeviceApiResponseModel";
import {jwtAuthService} from "../../../common/services/jwtService";
import {JwtPayload} from "jsonwebtoken";

export const securityDevicesRouter = Router()

const devicesController = {
    async getAllDevices (req: Request, res: Response) {
        // TODO: valid middleware check cookie
        const token = req.cookies.refreshToken
        const { id } = jwtAuthService.verifyToken(token) as JwtPayload
        const sessions = await sessionsRepository.getAllSessions(id)

        const responseSessions: DeviceApiResponseModel[] = sessions.map(session => ({
            ip: session.ip,
            title: session.deviceName,
            lastActiveDate: new Date(session.issuedAt * 1000).toISOString(),
            deviceId: session.deviceId
        }))

        return res.json(responseSessions)
    }
}

securityDevicesRouter.get('/devices', devicesController.getAllDevices)