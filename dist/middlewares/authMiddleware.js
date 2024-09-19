"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.fromUTF8ToBase64 = void 0;
const config_1 = require("../utils/config");
const fromUTF8ToBase64 = (code) => {
    const buff2 = Buffer.from(code, 'utf8');
    const codedAuth = buff2.toString('base64');
    return codedAuth;
};
exports.fromUTF8ToBase64 = fromUTF8ToBase64;
const authMiddleware = (req, res, next) => {
    const auth = req.headers['authorization'];
    if (!auth) {
        res
            .status(401)
            .json({});
        return;
    }
    if (auth.slice(0, 6) !== 'Basic ') {
        res
            .status(401)
            .json({});
        return;
    }
    const codedAuth = (0, exports.fromUTF8ToBase64)(String(config_1.CONFIG.LOGIN));
    if (auth.slice(6) !== codedAuth) {
        res
            .status(401)
            .json({});
        return;
    }
    next();
};
exports.authMiddleware = authMiddleware;
