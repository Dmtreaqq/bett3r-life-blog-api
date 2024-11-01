import { Router, Request, Response, NextFunction } from "express";
import { cookieValidationMiddleware } from "../../../common/middlewares/cookieValidationMiddleware";
import { sessionsService } from "../sessions/sessionsService";
import { HTTP_STATUSES, RequestWparams } from "../../../common/utils/types";
import { deviceQueryRepository } from "./deviceQueryRepository";

export const securityDevicesRouter = Router();

const devicesController = {
  async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const devices = await deviceQueryRepository.getAllDevices(refreshToken);

      return res.json(devices);
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
