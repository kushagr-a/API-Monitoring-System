import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
dotenv.config();

export const config = {
    // server
    node_env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "4000", 10), // here passing 10 cause i want they return decimal number

    //MongoDB
    mongo: {
        uri: process.env.MONGO_URI || "mongodb://localhost:27017/api_monitoring",
        dbName: process.env.MONGO_DB_NAME || "api_monitoring",
    },

    // Postgres
    postgres: {
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
        database: process.env.POSTGRES_DB || "api_monitoring",
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "postgres",
    },

    // RabbitMQ
    rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue: process.env.RABBITMQ_QUEUE || "api_hits",
        publisherConfirms: process.env.RABBITMQ_PUBLISHER_CONFIRMS === "true" || false,
        retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || "3", 10),
        retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || "1000", 10),
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || "mySecret",
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },

    // Rate Limit
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || "1000", 10), // 1000 requests per 15 minutes
    },

    // pgAdmin
    pgadmin: {
        email: process.env.PGADMIN_DEFAULT_EMAIL || "[EMAIL_ADDRESS]",
        password: process.env.PGADMIN_DEFAULT_PASSWORD || "admin",
    },


}