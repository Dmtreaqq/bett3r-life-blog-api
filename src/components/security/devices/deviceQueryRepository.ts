import { DeviceApiResponseModel } from "./models/DeviceApiResponseModel";
import { JwtAuthService } from "../../../common/services/jwtService";
import { JwtPayload } from "jsonwebtoken";
import { SessionModelClass } from "../../../common/db/models/Session";

export class DeviceQueryRepository {
  private jwtAuthService: JwtAuthService;
  constructor() {
    this.jwtAuthService = new JwtAuthService();
  }

  async getAllDevices(refreshToken: string): Promise<DeviceApiResponseModel[]> {
    const { id } = this.jwtAuthService.decodeToken(refreshToken) as JwtPayload;

    const sessions = await SessionModelClass.find({ userId: id }).lean();

    const responseSessions: DeviceApiResponseModel[] = sessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: new Date(session.issuedAt * 1000).toISOString(),
      deviceId: session.deviceId,
    }));

    return responseSessions;
  }
}
