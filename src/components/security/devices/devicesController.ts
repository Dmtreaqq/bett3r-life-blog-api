import {Router, Request, Response, NextFunction} from "express";
import {sessionsRepository} from "../sessions/sessionsRepository";
import {DeviceApiResponseModel} from "./DeviceApiResponseModel";
import {jwtAuthService} from "../../../common/services/jwtService";
import {JwtPayload} from "jsonwebtoken";
import {cookieValidationMiddleware} from "../../../common/middlewares/cookieValidationMiddleware";

export const securityDevicesRouter = Router()

const devicesController = {
    async getAllDevices (req: Request, res: Response, next: NextFunction) {
        try {
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
        } catch (err) {
            return next(err)
        }
    }
}

securityDevicesRouter.get('/devices', cookieValidationMiddleware, devicesController.getAllDevices)