import { SessionDbModel } from "./models/SessionDbModel";
import { SessionModelClass } from "../../../common/db/models/Session";
import { injectable } from "inversify";

@injectable()
export class SessionsRepository {
  async createSession(sessionDbModel: SessionDbModel) {
    await SessionModelClass.create(sessionDbModel);
  }

  async updateSession(
    deviceId: string,
    issuedAt: number,
    newIssuedAt: number,
    expDate: number,
  ) {
    const result = await SessionModelClass.updateOne(
      { issuedAt, deviceId },
      {
        $set: { issuedAt: newIssuedAt, expirationDate: expDate },
      },
    );

    return result.modifiedCount === 1;
  }

  async isActiveSession(deviceId: string, issuedAt: number) {
    const session = await SessionModelClass.findOne({
      deviceId,
      issuedAt,
    });

    return session;
  }

  async deleteSession(deviceId: string, userId: string) {
    const result = await SessionModelClass.deleteOne({
      deviceId,
      userId,
    });

    return result.deletedCount === 1;
  }

  async getSessionByDeviceId(deviceId: string) {
    // TODO а если с одного девайса 2 сессии
    return SessionModelClass.findOne({ deviceId });
  }

  async deleteAllSessions() {
    await SessionModelClass.deleteMany({});
  }

  async deleteOtherSessions(userId: string, currentDeviceId: string) {
    await SessionModelClass.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });
  }
}
