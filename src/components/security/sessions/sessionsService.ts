import { SessionsRepository } from "./sessionsRepository";
import { SessionDbModel } from "./models/SessionDbModel";
import { JwtAuthService } from "../../../common/services/jwtService";
import { ApiError } from "../../../common/utils/ApiError";
import { HTTP_STATUSES } from "../../../common/utils/types";

export class SessionsService {
  private jwtAuthService: JwtAuthService;
  private sessionsRepository: SessionsRepository;
  constructor() {
    this.jwtAuthService = new JwtAuthService();
    this.sessionsRepository = new SessionsRepository();
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

    await this.sessionsRepository.createSession(session);
  }

  async updateSession(oldRefreshToken: string, newRefreshToken: string) {
    const { iat: oldIat, deviceId } = this.jwtAuthService.decodeToken(oldRefreshToken);
    const { iat: newIat, exp } = this.jwtAuthService.decodeToken(newRefreshToken);

    await this.sessionsRepository.updateSession(deviceId, oldIat!, newIat!, exp!);
  }

  async isActiveSession(refreshToken: string): Promise<SessionDbModel | null> {
    const { iat, deviceId } = this.jwtAuthService.decodeToken(refreshToken);
    const result = await this.sessionsRepository.isActiveSession(deviceId, iat!);
    if (!result) {
      return null;
    }

    return result;
  }

  async deleteSession(refreshToken: string, passedDeviceId: string) {
    const { id: userId } = this.jwtAuthService.decodeToken(refreshToken);

    const userSession = await this.sessionsRepository.getSessionByDeviceId(passedDeviceId);

    if (!userSession) {
      throw new ApiError(HTTP_STATUSES.NOT_FOUND_404, "No Session By Device Id");
    }

    if (userSession.userId !== userId) {
      throw new ApiError(HTTP_STATUSES.FORBIDDEN_403);
    }

    const result = await this.sessionsRepository.deleteSession(passedDeviceId, userId);

    return result;
  }

  async deleteOtherSessions(refreshToken: string) {
    const { id: userId, deviceId: currentDeviceId } =
      this.jwtAuthService.decodeToken(refreshToken);

    await this.sessionsRepository.deleteOtherSessions(userId, currentDeviceId);
  }
}
