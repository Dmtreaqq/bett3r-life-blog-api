import { AuthLoginApiRequestModel, AuthRegisterApiRequestModel } from "./models/AuthApiModel";
import { usersRepository } from "../users/repositories/usersRepository";
import { ApiError } from "../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../common/utils/types";
import { hashService } from "../../common/services/hashService";
import { jwtAuthService } from "../../common/services/jwtService";
import { UserDbModel } from "../users/models/UserDbModel";
import { randomUUID } from "node:crypto";
import { add } from "date-fns/add";
import { emailService } from "../../common/services/emailService";
import { sessionsService } from "../security/sessions/sessionsService";

export const authService = {
  async login(
    authInput: AuthLoginApiRequestModel,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userByLogin = await usersRepository.getUserByLogin(authInput.loginOrEmail);
    const userByEmail = await usersRepository.getUserByEmail(authInput.loginOrEmail);

    const user = userByEmail || userByLogin;
    if (!user) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const isValidPassword = await hashService.checkPassword(authInput.password, user.password);
    if (!isValidPassword) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const accessToken = jwtAuthService.createAccessToken({
      id: user._id.toString(),
    });

    const refreshToken = jwtAuthService.createRefreshToken({
      id: user._id.toString(),
      deviceId: randomUUID(),
      versionId: randomUUID() + 1,
    });

    return {
      accessToken,
      refreshToken,
    };
  },

  async logout(refreshToken: string): Promise<boolean> {
    const session = await sessionsService.isActiveSession(refreshToken);

    if (!session) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const result = await sessionsService.deleteSession(refreshToken, session.deviceId);

    return result;
  },

  async register(registerModel: AuthRegisterApiRequestModel): Promise<string> {
    const userByEmail = await usersRepository.getUserByEmail(registerModel.email);
    const userByLogin = await usersRepository.getUserByLogin(registerModel.login);

    if (userByEmail || userByLogin) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "User already exists", "email");
    }

    const hashedPassword = await hashService.hashPassword(registerModel.password);

    const confirmationCode = randomUUID();
    const userDbModel: UserDbModel = {
      login: registerModel.login,
      email: registerModel.email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isConfirmed: false,
      confirmationCode,
      expirationDate: add(new Date(), {
        minutes: 2,
      }).toISOString(),
    };

    const userId = await usersRepository.createUser(userDbModel);

    emailService
      .sendConfirmationEmail(confirmationCode, registerModel.email)
      .catch((err) =>
        console.log(`Email wasn't sent for ${registerModel.email}. Err: ${err}`),
      );

    return userId;
  },

  async confirmRegister(code: string): Promise<boolean | null> {
    const user = await usersRepository.getUserByConfirmationCode(code);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "Bad Request - No User", "code");
    }

    if (user.isConfirmed) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "User already confirmed", "code");
    }

    if (user.expirationDate < new Date().toISOString()) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "Code is expired", "code");
    }

    const result = await usersRepository.updateConfirmation(user._id.toString());

    return result;
  },

  async resendConfirmationEmail(email: string) {
    const user = await usersRepository.getUserByEmail(email);
    if (!user) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "Bad Request - No User", "email");
    }

    if (user.isConfirmed) {
      throw new ApiError(HTTP_STATUSES.BAD_REQUEST_400, "User already confirmed", "email");
    }

    const code = await usersRepository.updateCodeForEmail(user._id.toString());

    emailService
      .sendConfirmationEmail(code, email)
      .catch((err) => console.log(`Email wasn't sent for ${email}. Err: ${err}`));

    return code;
  },

  async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const oldRefreshTokenValid = jwtAuthService.decodeToken(oldRefreshToken);
    const { id, deviceId } = oldRefreshTokenValid;
    const isSessionActive = await sessionsService.isActiveSession(oldRefreshToken);

    if (!isSessionActive) {
      throw new ApiError(HTTP_STATUSES.NOT_AUTHORIZED_401);
    }

    const accessToken = jwtAuthService.createAccessToken({ id });
    const refreshToken = jwtAuthService.createRefreshToken({
      id,
      deviceId,
      versionId: randomUUID() + 1,
    });

    await sessionsService.updateSession(oldRefreshToken, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  },
};
