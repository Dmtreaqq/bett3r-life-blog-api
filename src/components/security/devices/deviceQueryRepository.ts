import { DeviceApiResponseModel } from "./models/DeviceApiResponseModel";
import { sessionsCollection } from "../../../common/db/db";
import { jwtAuthService } from "../../../common/services/jwtService";
import { JwtPayload } from "jsonwebtoken";

export const deviceQueryRepository = {
  async getAllDevices(refreshToken: string): Promise<DeviceApiResponseModel[]> {
    const { id } = jwtAuthService.decodeToken(refreshToken) as JwtPayload;

    const sessions = await sessionsCollection.find({ userId: id }).toArray();

    const responseSessions: DeviceApiResponseModel[] = sessions.map((session) => ({
      ip: session.ip,
      title: session.deviceName,
      lastActiveDate: new Date(session.issuedAt * 1000).toISOString(),
      deviceId: session.deviceId,
    }));

    return responseSessions;
  },
};
