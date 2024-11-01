/* eslint-disable */

import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const resultArray: any = result.array({ onlyFirstError: true });
        const errorsMessages = resultArray.map((err: { path: any; msg: any; }) => ({ field: err.path, message: err.msg }));

        return res.status(400).json({ errorsMessages })
    } else {
        return next();
    }
}
