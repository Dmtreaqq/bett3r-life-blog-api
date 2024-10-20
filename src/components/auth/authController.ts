import {NextFunction, Response, Router} from 'express'
import {HTTP_STATUSES, RequestWbody} from "../../utils/types";
import {AuthLoginApiRequestModel} from "./models/AuthApiModel";
import {authService} from "./authService";
import authValidation from "./middlewares/authValidation";

export const authRouter = Router()

const authController = {
    async login(req: RequestWbody<AuthLoginApiRequestModel>, res: Response, next: NextFunction) {
        try {
            const token = await authService.login(req.body)

            return res.json({
                accessToken: token
            })
        } catch (err) {
            return next(err)
        }
    }
}

authRouter.post('/login', ...authValidation,  authController.login)
