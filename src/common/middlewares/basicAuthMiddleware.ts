import { Response, Request, NextFunction } from 'express'
import { CONFIG } from '../utils/config'
import {HTTP_STATUSES} from "../utils/types";

export const fromUTF8ToBase64 = (code: string) => {
    const buff2 = Buffer.from(code, 'utf8')
    const codedAuth = buff2.toString('base64')
    return codedAuth
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'] as string
    if (!auth || auth.split(' ')[0] !== 'Basic') {
        return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
    }

    const codedAuth = fromUTF8ToBase64(String(CONFIG.LOGIN))

    if (auth.slice(6) !== codedAuth) {
        return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
    }

    return next()
}
