import { ApiError } from "../utils/ApiError";
import { NextFunction, Request, Response } from "express";
import { ApiErrorResult, HTTP_STATUSES } from "../utils/types";

export const errorHandlerMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    if (err.message) {
      return res.status(err.httpCode).json({
        errorsMessages: [
          {
            message: err.message,
            field: err.field,
          },
        ],
      } as ApiErrorResult);
    } else {
      return res.sendStatus(err.httpCode);
    }
  } else {
    console.log(err);

    return res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
  }
};
