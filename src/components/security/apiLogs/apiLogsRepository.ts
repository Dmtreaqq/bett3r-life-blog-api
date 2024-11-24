import { ApiLogDbModel } from "./models/ApiLogDbModel";
import { ApiLogClassModel } from "../../../common/db/models/ApiLog";

class ApiLogsRepository {
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

export const apiLogsRepository = new ApiLogsRepository();
