import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    PORT: process.env.PORT || 3006,
    PATH: {
        TESTING: '/testing',
        POSTS: '/posts',
        BLOGS: '/blogs',
    },
    LOGIN: process.env.LOGIN,
    PASSWORD: process.env.PASSWORD,
}