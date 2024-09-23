import { Response, Request, NextFunction } from 'express'
import { CONFIG } from '../utils/config'

export const fromUTF8ToBase64 = (code: string) => {
    const buff2 = Buffer.from(code, 'utf8')
    const codedAuth = buff2.toString('base64')
    return codedAuth
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'] as string
    if (!auth || auth.split(' ')[0] !== 'Basic') {
        res
            .status(401)
            .json({})
        return
    }

    const codedAuth = fromUTF8ToBase64(String(CONFIG.LOGIN))

    if (auth.slice(6) !== codedAuth) {
        res
            .status(401)
            .json({})
        return
    }

    next()
}