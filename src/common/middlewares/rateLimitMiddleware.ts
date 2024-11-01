import { NextFunction, Request, Response } from "express";
import { apiLogsService } from "../../components/security/apiLogs/apiLogsService";
import { HTTP_STATUSES } from "../utils/types";

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { ip, originalUrl } = req;

  await apiLogsService.createApiLog(ip as string, originalUrl);

  const logsCount = await apiLogsService.getLogsCountLastTenSeconds(ip as string, originalUrl);

  if (logsCount > 5) {
    return res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429);
  }

  return next();
};
