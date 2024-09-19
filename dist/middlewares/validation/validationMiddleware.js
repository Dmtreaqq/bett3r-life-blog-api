"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const validationMiddleware = (req, res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        const resultArray = result.array({ onlyFirstError: true });
        const errorsMessages = resultArray.map((err) => ({ field: err.path, message: err.msg }));
        res.status(400).json({ errorsMessages });
    }
    else {
        next();
    }
};
exports.validationMiddleware = validationMiddleware;
