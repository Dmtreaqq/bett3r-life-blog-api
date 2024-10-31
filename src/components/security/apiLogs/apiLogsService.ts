import {apiLogsRepository} from "./apiLogsRepository";
import {ApiLogDbModel} from "./models/ApiLogDbModel";

export const apiLogsService = {
    async createApiLog(ip: string, url: string) {
        const log: ApiLogDbModel = {
            ip: ip || 'Unknown IP',
            url: url || 'Unknown URL',
            date: Date.now()
        }

        await apiLogsRepository.createApiLog(log)
    },

    async getApiLogByIpAndUrl(ip: string, url: string) {
        return apiLogsRepository.getLogsCountByIpAndUrl(ip, url)
    }
}