import { NextFunction, Request, Response, Router } from "express";
import { HTTP_STATUSES, RequestWbody } from "../../common/utils/types";
import {
  AuthLoginApiRequestModel,
  AuthMeInfoResponseModel,
  AuthRegisterApiRequestModel,
} from "./models/AuthApiModel";
import { authService } from "./authService";
import authValidation from "./middlewares/authValidation";
import { jwtAuthMiddleware } from "../../common/middlewares/jwtAuthMiddleware";
import { usersQueryRepository } from "../users/repositories/usersQueryRepository";
import confirmCodeValidation from "./middlewares/confirmCodeValidation";
import registerValidation from "./middlewares/registerValidation";
import emailResendValidation from "./middlewares/emailResendValidation";
import { sessionsService } from "../security/sessions/sessionsService";
import { cookieValidationMiddleware } from "../../common/middlewares/cookieValidationMiddleware";

export const authRouter = Router();

const authController = {
  async login(req: RequestWbody<AuthLoginApiRequestModel>, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await authService.login(req.body);
      await sessionsService.createSession(refreshToken, req.ip, req.header("user-agent"));

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
      });

      return res.json({
        accessToken: `${accessToken}`,
      });
    } catch (err) {
      return next(err);
    }
  },

  async getCurrentUserInfo(
    req: Request,
    res: Response<AuthMeInfoResponseModel>,
    next: NextFunction,
  ) {
    try {
      const user = await usersQueryRepository.getUserById(req.user.id);
      const response: AuthMeInfoResponseModel = {
        login: user!.login,
        email: user!.email,
        userId: user!.id,
      };

      return res.json(response);
    } catch (err) {
      return next(err);
    }
  },

  async register(
    req: RequestWbody<AuthRegisterApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await authService.register(req.body);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  },

  async confirmRegister(
    req: RequestWbody<{ code: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await authService.confirmRegister(req.body.code);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  },

  async resendConfirmationEmail(
    req: RequestWbody<{ email: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await authService.resendConfirmationEmail(req.body.email);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const currentRefreshToken = req.cookies.refreshToken;
      const { accessToken, refreshToken } =
        await authService.refreshToken(currentRefreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
      });

      return res.json({ accessToken });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const currentRefreshToken = req.cookies.refreshToken;
      const result = await authService.logout(currentRefreshToken);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      }

      res.clearCookie("refreshToken", { path: "/" });

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  },
};

authRouter.post("/login", ...authValidation, authController.login);
authRouter.post("/logout", cookieValidationMiddleware, authController.logout);
authRouter.post("/refresh-token", cookieValidationMiddleware, authController.refreshToken);
authRouter.get("/me", jwtAuthMiddleware, authController.getCurrentUserInfo);
authRouter.post("/registration", ...registerValidation, authController.register);
authRouter.post(
  "/registration-confirmation",
  ...confirmCodeValidation,
  authController.confirmRegister,
);
authRouter.post(
  "/registration-email-resending",
  ...emailResendValidation,
  authController.resendConfirmationEmail,
);
