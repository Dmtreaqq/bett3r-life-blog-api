import {ApiError} from "../utils/ApiError";
import {NextFunction, Request, Response} from "express";
import {ApiErrorResult} from "../utils/types";

export const apiErrorHandlerMiddleware = async (err: ApiError, req: Request, res: Response, next: NextFunction) => {
    if (err.message) {
        return res.status(err.httpCode).json({
            errorsMessages: [{
                message: err.message,
                field: err.field
            }]
        } as ApiErrorResult)
    }

    return res.sendStatus(err.httpCode)
}
