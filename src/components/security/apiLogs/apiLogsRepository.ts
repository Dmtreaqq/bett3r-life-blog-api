import { apiLogsCollection } from "../../../common/db/db";
import { ApiLogDbModel } from "./models/ApiLogDbModel";

export const apiLogsRepository = {
  async createApiLog(log: ApiLogDbModel) {
    await apiLogsCollection.insertOne(log);
  },

  async getLogsCountLastTenSeconds(ip: string, url: string) {
    const count = await apiLogsCollection.countDocuments({
      ip,
      url,
      date: { $gte: Date.now() - 10000 },
    });

    return count;
  },

  async deleteAllLogs() {
    await apiLogsCollection.deleteMany({});
  },
};
