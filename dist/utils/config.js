"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.CONFIG = {
    PORT: process.env.PORT || 3006,
    PATH: {
        TESTING: '/testing',
        POSTS: '/posts',
        BLOGS: '/blogs',
    },
    LOGIN: process.env.LOGIN,
    PASSWORD: process.env.PASSWORD,
};
