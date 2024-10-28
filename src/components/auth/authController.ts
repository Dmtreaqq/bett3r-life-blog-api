import {NextFunction, Response, Router, Request} from 'express'
import {HTTP_STATUSES, RequestWbody} from "../../common/utils/types";
import {AuthLoginApiRequestModel, AuthMeInfoResponseModel, AuthRegisterApiRequestModel} from "./models/AuthApiModel";
import {authService} from "./authService";
import authValidation from "./middlewares/authValidation";
import {jwtAuthMiddleware} from "../../common/middlewares/jwtAuthMiddleware";
import {usersQueryRepository} from "../users/repositories/usersQueryRepository";
import confirmCodeValidation from "./middlewares/confirmCodeValidation";
import registerValidation from "./middlewares/registerValidation";
import emailResendValidation from "./middlewares/emailResendValidation";

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

    async getCurrentUserInfo(req: Request, res: Response<AuthMeInfoResponseModel>, next: NextFunction) {
        try {
            const user = await usersQueryRepository.getUserById(req.user.id)
            const response: AuthMeInfoResponseModel = {
                login: user!.login,
                email: user!.email,
                userId: user!.id
            }

            return res.json(response)
        } catch (err) {
            return next(err)
        }
    },

    async register(req: RequestWbody<AuthRegisterApiRequestModel>, res: Response, next: NextFunction) {
        try {
            await authService.register(req.body)

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } catch (err) {
            return next(err)
        }
    },

    async confirmRegister(req: RequestWbody<{ code: string }>, res: Response, next: NextFunction) {
        try {
            await authService.confirmRegister(req.body.code)

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } catch (err) {
            return next(err)
        }
    },

    async resendConfirmationEmail(req: RequestWbody<{ email: string }>, res: Response, next: NextFunction) {
        try {
            await authService.resendConfirmationEmail(req.body.email)

            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        } catch (err) {
            return next(err)
        }
    }
}

authRouter.post('/login', ...authValidation,  authController.login)
authRouter.get('/me', jwtAuthMiddleware,  authController.getCurrentUserInfo)
authRouter.post('/registration', ...registerValidation,  authController.register)
authRouter.post('/registration-confirmation', ...confirmCodeValidation, authController.confirmRegister)
authRouter.post('/registration-email-resending', ...emailResendValidation, authController.resendConfirmationEmail)
