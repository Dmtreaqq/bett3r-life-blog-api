import { NextFunction, Request, Response, Router } from "express";
import { HTTP_STATUSES, RequestWbody } from "../../common/utils/types";
import { AuthMeInfoResponseModel } from "./models/AuthMeInfoResponseModel";
import { AuthService } from "./authService";
import authValidation from "./middlewares/authValidation";
import { jwtAuthMiddleware } from "../../common/middlewares/jwtAuthMiddleware";
import { UsersQueryRepository } from "../users/repositories/usersQueryRepository";
import confirmCodeValidation from "./middlewares/confirmCodeValidation";
import registerValidation from "./middlewares/registerValidation";
import emailResendValidation from "./middlewares/emailResendValidation";
import { SessionsService } from "../security/sessions/sessionsService";
import { cookieValidationMiddleware } from "../../common/middlewares/cookieValidationMiddleware";
import confirmPasswordValidation from "./middlewares/confirmPasswordValidation";
import { AuthLoginApiRequestModel } from "./models/AuthLoginApiRequestModel";
import { AuthRegisterApiRequestModel } from "./models/AuthRegisterApiRequestModel";

export const authRouter = Router();

class AuthController {
  private authService: AuthService;
  private usersQueryRepository: UsersQueryRepository;
  private sessionsService: SessionsService;
  constructor() {
    this.authService = new AuthService();
    this.usersQueryRepository = new UsersQueryRepository();
    this.sessionsService = new SessionsService();
  }

  async login(req: RequestWbody<AuthLoginApiRequestModel>, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } = await this.authService.login(req.body);
      await this.sessionsService.createSession(refreshToken, req.ip, req.header("user-agent"));

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
  }

  async getCurrentUserInfo(
    req: Request,
    res: Response<AuthMeInfoResponseModel>,
    next: NextFunction,
  ) {
    try {
      const user = await this.usersQueryRepository.getUserById(req.user.id);
      const response: AuthMeInfoResponseModel = {
        login: user!.login,
        email: user!.email,
        userId: user!.id,
      };

      return res.json(response);
    } catch (err) {
      return next(err);
    }
  }

  async register(
    req: RequestWbody<AuthRegisterApiRequestModel>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.authService.register(req.body);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async confirmRegister(
    req: RequestWbody<{ code: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.authService.confirmRegister(req.body.code);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async resendConfirmationEmail(
    req: RequestWbody<{ email: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.authService.resendConfirmationEmail(req.body.email);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const currentRefreshToken = req.cookies.refreshToken;
      const { accessToken, refreshToken } =
        await this.authService.refreshToken(currentRefreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
      });

      return res.json({ accessToken });
    } catch (err) {
      return next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const currentRefreshToken = req.cookies.refreshToken;
      const result = await this.authService.logout(currentRefreshToken);

      if (!result) {
        return res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
      }

      res.clearCookie("refreshToken", { path: "/" });

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async recoverPassword(
    req: RequestWbody<{ email: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { email } = req.body;

      await this.authService.recoverPassword(email);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }

  async confirmPasswordRecovery(
    req: RequestWbody<{ newPassword: string; recoveryCode: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { newPassword, recoveryCode } = req.body;
      await this.authService.confirmPasswordRecovery(newPassword, recoveryCode);

      return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    } catch (err) {
      return next(err);
    }
  }
}

const authController = new AuthController();

authRouter.post("/login", ...authValidation, authController.login.bind(authController));
authRouter.post(
  "/logout",
  cookieValidationMiddleware,
  authController.logout.bind(authController),
);
authRouter.post(
  "/refresh-token",
  cookieValidationMiddleware,
  authController.refreshToken.bind(authController),
);
authRouter.get(
  "/me",
  jwtAuthMiddleware,
  authController.getCurrentUserInfo.bind(authController),
);
authRouter.post(
  "/registration",
  ...registerValidation,
  authController.register.bind(authController),
);
authRouter.post(
  "/registration-confirmation",
  ...confirmCodeValidation,
  authController.confirmRegister.bind(authController),
);
authRouter.post(
  "/registration-email-resending",
  ...emailResendValidation,
  authController.resendConfirmationEmail.bind(authController),
);
authRouter.post(
  "/password-recovery",
  ...emailResendValidation,
  authController.recoverPassword.bind(authController),
);
authRouter.post(
  "/new-password",
  confirmPasswordValidation,
  authController.confirmPasswordRecovery.bind(authController),
);
