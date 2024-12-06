import { UsersRepository } from "../users/repositories/usersRepository";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { HashService } from "../../common/services/hashService";
import { JwtAuthService } from "../../common/services/jwtService";
import { UserDbModel } from "../users/models/UserDbModel";
import { randomUUID } from "node:crypto";
import { add } from "date-fns/add";
import { EmailService } from "../../common/services/emailService";
import { SessionsService } from "../security/sessions/sessionsService";
import { AuthLoginApiRequestModel } from "./models/AuthLoginApiRequestModel";
import { AuthRegisterApiRequestModel } from "./models/AuthRegisterApiRequestModel";
import { injectable } from "inversify";

@injectable()
export class AuthService {
  private jwtAuthService: JwtAuthService;
  private hashService: HashService;
  private emailService: EmailService;

  constructor(
    private sessionsService: SessionsService,
    private usersRepository: UsersRepository,
  ) {
    this.jwtAuthService = new JwtAuthService();
    this.hashService = new HashService();
    this.emailService = new EmailService();
  }

  async login(
    authInput: AuthLoginApiRequestModel,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userByLogin = await this.usersRepository.getUserByLogin(authInput.loginOrEmail);
    const userByEmail = await this.usersRepository.getUserByEmail(authInput.loginOrEmail);

    const user = userByEmail || userByLogin;
    if (!user) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const isValidPassword = await this.hashService.checkPassword(
      authInput.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const accessToken = this.jwtAuthService.createAccessToken({
      id: user._id.toString(),
    });

    const refreshToken = this.jwtAuthService.createRefreshToken({
      id: user._id.toString(),
      deviceId: randomUUID(),
      versionId: randomUUID() + 1,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string): Promise<boolean> {
    const session = await this.sessionsService.isActiveSession(refreshToken);

    if (!session) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const result = await this.sessionsService.deleteSession(refreshToken, session.deviceId);

    return result;
  }

  async register(registerModel: AuthRegisterApiRequestModel): Promise<string> {
    const userByEmail = await this.usersRepository.getUserByEmail(registerModel.email);
    const userByLogin = await this.usersRepository.getUserByLogin(registerModel.login);

    if (userByEmail || userByLogin) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "User already exists", "email");
    }

    const hashedPassword = await this.hashService.hashPassword(registerModel.password);

    const confirmationCode = randomUUID();
    const recoveryCode = randomUUID();
    const userDbModel = new UserDbModel(
      registerModel.login,
      registerModel.email,
      hashedPassword,
      new Date().toISOString(),
      false,
      confirmationCode,
      recoveryCode,
      add(new Date(), {
        minutes: 2,
      }).toISOString(),
      add(new Date(), {
        minutes: 2,
      }).toISOString(),
      [],
      [],
    );

    const userId = await this.usersRepository.createUser(userDbModel);

    this.emailService
      .sendConfirmationEmail(confirmationCode, registerModel.email)
      .catch((err) =>
        console.log(`Email wasn't sent for ${registerModel.email}. Err: ${err}`),
      );

    return userId;
  }

  async confirmRegister(code: string): Promise<boolean | null> {
    const user = await this.usersRepository.getUserByConfirmationCode(code);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "Bad Request - No User", "code");
    }

    if (user.isConfirmed) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "User already confirmed", "code");
    }

    if (user.expirationDate < new Date().toISOString()) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "Code is expired", "code");
    }

    const result = await this.usersRepository.updateConfirmation(user._id.toString());

    return result;
  }

  async resendConfirmationEmail(email: string) {
    const user = await this.usersRepository.getUserByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "Bad Request - No User", "email");
    }

    if (user.isConfirmed) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "User already confirmed", "email");
    }

    const code = await this.usersRepository.updateCodeForEmail(user._id.toString());

    this.emailService
      .sendConfirmationEmail(code, email)
      .catch((err) => console.log(`Email wasn't sent for ${email}. Err: ${err}`));

    return code;
  }

  async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const oldRefreshTokenValid = this.jwtAuthService.decodeToken(oldRefreshToken);
    const { id, deviceId } = oldRefreshTokenValid;
    const isSessionActive = await this.sessionsService.isActiveSession(oldRefreshToken);

    if (!isSessionActive) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const accessToken = this.jwtAuthService.createAccessToken({ id });
    const refreshToken = this.jwtAuthService.createRefreshToken({
      id,
      deviceId,
      versionId: randomUUID() + 1,
    });

    await this.sessionsService.updateSession(oldRefreshToken, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async recoverPassword(email: string) {
    const user = await this.usersRepository.getUserByEmail(email);

    if (!user) {
      return;
    }

    const code = await this.usersRepository.updateCodeForPassword(user._id.toString());

    this.emailService.sendRecoverPasswordEmail(code, email).catch((err) => console.log(err));
  }

  async confirmPasswordRecovery(newPassword: string, recoveryCode: string) {
    const userByCode = await this.usersRepository.getUserByRecoveryCode(recoveryCode);

    if (!userByCode) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "incorrect", "recoveryCode");
    }

    if (userByCode.recoveryCodeExpirationDate < new Date().toISOString()) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "expired", "recoveryCode");
    }

    const newHashedPassword = await this.hashService.hashPassword(newPassword);
    await this.usersRepository.updatePassword(userByCode._id.toString(), newHashedPassword);
  }
}
