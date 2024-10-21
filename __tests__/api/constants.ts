import {BlogApiRequestModel} from "../../src/components/blogs/models/BlogApiModel";
import {fromUTF8ToBase64} from "../../src/common/middlewares/basicAuthMiddleware";
import {CONFIG} from "../../src/common/utils/config";

export const baseUrl = '/api';
export const authHeader = `Basic ${fromUTF8ToBase64(String(CONFIG.LOGIN))}`;
// description: 'Some description' + Math.floor(Math.random() * 5 + 1),

export const blogApiRequestModel: BlogApiRequestModel = {
    name: 'BlogName',
    description: 'BlogDescription',
    websiteUrl: 'https://blog-website.com',
}