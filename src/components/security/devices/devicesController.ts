import { Router, Request, Response, NextFunction } from "express";
import { sessionsRepository } from "../sessions/sessionsRepository";
import { DeviceApiResponseModel } from "./DeviceApiResponseModel";
import { jwtAuthService } from "../../../common/services/jwtService";
import { JwtPayload } from "jsonwebtoken";
import { cookieValidationMiddleware } from "../../../common/middlewares/cookieValidationMiddleware";
import { sessionsService } from "../sessions/sessionsService";
import { HTTP_STATUSES, RequestWparams } from "../../../common/utils/types";

export const securityDevicesRouter = Router();

const devicesController = {
  async getAllDevices(req: Request, res: Response, next: NextFunction) {
    // TODO: перенести в сервис, сделать queryRepo
    try {
      const token = req.cookies.refreshToken;
      const { id } = jwtAuthService.verifyToken(token) as JwtPayload;

      const sessions = await sessionsRepository.getAllSessions(id);

      const responseSessions: DeviceApiResponseModel[] = sessions.map((session) => ({
        ip: session.ip,
        title: session.deviceName,
        lastActiveDate: new Date(session.issuedAt * 1000).toISOString(),
        deviceId: session.deviceId,
      }));

      return res.json(responseSessions);
    } catch (err) {
      return next(err);
    }
  },

  async deleteDevice(req: RequestWparams<{ id: string }>, res: Response, next: NextFunction) {
    // TODO: разрешаем ли мьі несколько сессий с одного девайса
    try {
      const { refreshToken } = req.cookies;
      const passedDeviceId = req.params.id;

      // const { deviceId, iat } = jwtAuthService.decodeToken(refreshToken)
      // const isActiveSession = await sessionsRepository.isActiveSession(deviceId, iat!)
      //
      // if (!isActiveSession) {
      //     return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
      // }

      await sessionsService.deleteSession(refreshToken, passedDeviceId);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  },

  async deleteOtherDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;

      // const { deviceId, iat } = jwtAuthService.decodeToken(refreshToken)
      // const isActiveSession = await sessionsRepository.isActiveSession(deviceId, iat!)
      //
      // if (!isActiveSession) {
      //     return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
      // }

      await sessionsService.deleteOtherSessions(refreshToken);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  },
};

securityDevicesRouter.get(
  "/devices",
  cookieValidationMiddleware,
  devicesController.getAllDevices,
);
securityDevicesRouter.delete(
  "/devices",
  cookieValidationMiddleware,
  devicesController.deleteOtherDevices,
);
securityDevicesRouter.delete(
  "/devices/:id",
  cookieValidationMiddleware,
  devicesController.deleteDevice,
);
