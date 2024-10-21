import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const CONFIG = {
    PORT: process.env.PORT || 3006,
    PATH: {
        TESTING: '/testing',
        POSTS: '/posts',
        BLOGS: '/blogs',
        USERS: '/users',
        AUTH: '/auth',
        COMMENTS: '/comments'
    },
    LOGIN: process.env.LOGIN,
    LOCAL_MONGO_URL: 'mongodb://localhost:27017/?retryWrites=true',
    MONGO_URL: `mongodb+srv://${String(process.env.MONGO_USERNAME)}:${String(process.env.MONGO_PASSWORD)}@cluster0.klsta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    IS_API_TEST: process.env.IS_API_TEST,
}
