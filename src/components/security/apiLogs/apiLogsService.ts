import { apiLogsRepository } from "./apiLogsRepository";
import { ApiLogDbModel } from "./models/ApiLogDbModel";

class ApiLogsService {
  async createApiLog(ip: string, url: string) {
    const log = new ApiLogDbModel(ip || "Unknown IP", url || "Unknown URL", Date.now());

    await apiLogsRepository.createApiLog(log);
  }

  async getLogsCountLastTenSeconds(ip: string, url: string) {
    return apiLogsRepository.getLogsCountLastTenSeconds(ip, url);
  }
}

export const apiLogsService = new ApiLogsService();
