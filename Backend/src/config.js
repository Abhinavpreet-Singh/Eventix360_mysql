import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 4000,
    frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    mysql: {
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'mysqp'
    }
};


