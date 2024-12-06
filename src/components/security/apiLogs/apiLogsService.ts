import { ApiLogsRepository } from "./apiLogsRepository";
import { ApiLogDbModel } from "./models/ApiLogDbModel";
import { injectable } from "inversify";

@injectable()
export class ApiLogsService {
  constructor(private apiLogsRepository: ApiLogsRepository) {}

  async createApiLog(ip: string, url: string) {
    const log = new ApiLogDbModel(ip || "Unknown IP", url || "Unknown URL", Date.now());

    await this.apiLogsRepository.createApiLog(log);
  }

  async getLogsCountLastTenSeconds(ip: string, url: string) {
    return this.apiLogsRepository.getLogsCountLastTenSeconds(ip, url);
  }
}
