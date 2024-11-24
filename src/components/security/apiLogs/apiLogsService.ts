import { ApiLogsRepository } from "./apiLogsRepository";
import { ApiLogDbModel } from "./models/ApiLogDbModel";

export class ApiLogsService {
  private apiLogsRepository: ApiLogsRepository;
  constructor() {
    this.apiLogsRepository = new ApiLogsRepository();
  }

  async createApiLog(ip: string, url: string) {
    const log = new ApiLogDbModel(ip || "Unknown IP", url || "Unknown URL", Date.now());

    await this.apiLogsRepository.createApiLog(log);
  }

  async getLogsCountLastTenSeconds(ip: string, url: string) {
    return this.apiLogsRepository.getLogsCountLastTenSeconds(ip, url);
  }
}
