import { NextFunction, Request, Response } from "express";
import { JwtAuthService } from "../services/jwtService";
import { ApiError } from "../utils/ApiError";
import { HTTP_STATUSES } from "../utils/types";

export const cookieValidationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { refreshToken } = req.cookies;

  if (refreshToken === "undefined") {
    throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
  }

  try {
    const jwtAuthService = new JwtAuthService();
    jwtAuthService.verifyToken(refreshToken);
  } catch (err) {
    console.log("Cookie not valid: ", err);
    throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
  }

  return next();
};
