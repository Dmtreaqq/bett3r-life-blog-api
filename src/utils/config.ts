import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const CONFIG = {
    PORT: process.env.PORT || 3006,
    PATH: {
        TESTING: '/testing',
        POSTS: '/posts',
        BLOGS: '/blogs',
    },
    LOGIN: process.env.LOGIN,
    MONGO_URL: `mongodb+srv://${String(process.env.MONGO_USERNAME)}:${String(process.env.MONGO_PASSWORD)}@cluster0.klsta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
}