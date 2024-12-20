import { ApiLogDbModel } from "./models/ApiLogDbModel";
import { ApiLogClassModel } from "../../../common/db/models/ApiLog";
import { injectable } from "inversify";

@injectable()
export class ApiLogsRepository {
  async createApiLog(log: ApiLogDbModel) {
    await ApiLogClassModel.create(log);
  }

  async getLogsCountLastTenSeconds(ip: string, url: string) {
    const count = await ApiLogClassModel.countDocuments({
      ip,
      url,
      date: { $gte: Date.now() - 10000 },
    });

    return count;
  }

  async deleteAllLogs() {
    await ApiLogClassModel.deleteMany({});
  }
}
