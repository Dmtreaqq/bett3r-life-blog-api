import { sessionsRepository } from "./sessionsRepository";
import { SessionDbModel } from "./models/SessionDbModel";
import { JwtAuthService } from "../../../common/services/jwtService";
import { ApiError } from "../../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../../common/utils/types";

class SessionsService {
  private jwtAuthService: JwtAuthService;
  constructor() {
    this.jwtAuthService = new JwtAuthService();
  }

  async createSession(refreshToken: string, ip = "Unknown IP", userAgent = "Unknown Device") {
    const token = this.jwtAuthService.decodeToken(refreshToken);

    const session = new SessionDbModel(
      token.id,
      token.deviceId,
      userAgent,
      ip,
      token.iat!,
      token.exp!,
    );

    await sessionsRepository.createSession(session);
  }

  async updateSession(oldRefreshToken: string, newRefreshToken: string) {
    const { iat: oldIat, deviceId } = this.jwtAuthService.decodeToken(oldRefreshToken);
    const { iat: newIat, exp } = this.jwtAuthService.decodeToken(newRefreshToken);

    await sessionsRepository.updateSession(deviceId, oldIat!, newIat!, exp!);
  }

  async isActiveSession(refreshToken: string): Promise<SessionDbModel | null> {
    const { iat, deviceId } = this.jwtAuthService.decodeToken(refreshToken);
    const result = await sessionsRepository.isActiveSession(deviceId, iat!);
    if (!result) {
      return null;
    }

    return result;
  }

  async deleteSession(refreshToken: string, passedDeviceId: string) {
    const { id: userId } = this.jwtAuthService.decodeToken(refreshToken);

    const userSession = await sessionsRepository.getSessionByDeviceId(passedDeviceId);

    if (!userSession) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404, "No Session By Device Id");
    }

    if (userSession.userId !== userId) {
      throw new ApiError(HTTP_STATUSES.FORBIDDEN_403);
    }

    const result = await sessionsRepository.deleteSession(passedDeviceId, userId);

    return result;
  }

  async deleteOtherSessions(refreshToken: string) {
    const { id: userId, deviceId: currentDeviceId } = this.jwtAuthService.decodeToken(refreshToken);

    await sessionsRepository.deleteOtherSessions(userId, currentDeviceId);
  }
}

export const sessionsService = new SessionsService();
