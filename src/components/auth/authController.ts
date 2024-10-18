import {NextFunction, Response, Router} from 'express'
import {HTTP_STATUSES, RequestWbody} from "../../utils/types";
import {AuthLoginApiRequestModel} from "./models/AuthApiModel";
import {authService} from "./authService";
import authValidation from "./middlewares/authValidation";

export const authRouter = Router()

const authController = {
    async login(req: RequestWbody<AuthLoginApiRequestModel>, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body)

            if (!result) {
                return res.sendStatus(HTTP_STATUSES.NOT_AUTHORIZED_401)
            }

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } catch (err) {
            return next(err)
        }
    }
}

authRouter.post('/login', ...authValidation,  authController.login)
