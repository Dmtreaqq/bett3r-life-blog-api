import {NextFunction, Response, Router, Request} from 'express'
import {RequestWbody} from "../../utils/types";
import {AuthLoginApiRequestModel, AuthMeInfoResponseModel} from "./models/AuthApiModel";
import {authService} from "./authService";
import authValidation from "./middlewares/authValidation";
import {jwtAuthMiddleware} from "../../middlewares/jwtAuthMiddleware";

export const authRouter = Router()

const authController = {
    async login(req: RequestWbody<AuthLoginApiRequestModel>, res: Response, next: NextFunction) {
        try {
            const token = await authService.login(req.body)

            return res.json({
                accessToken: `${token}`
            })
        } catch (err) {
            return next(err)
        }
    },

    async getCurrentUserInfo(req: Request, res: Response<AuthMeInfoResponseModel>) {
        const response: AuthMeInfoResponseModel = {
            login: req.user.login,
            email: req.user.email,
            userId: req.user.id
        }

        return res.json(response)
    }
}

authRouter.post('/login', ...authValidation,  authController.login)
authRouter.get('/me', jwtAuthMiddleware,  authController.getCurrentUserInfo)
