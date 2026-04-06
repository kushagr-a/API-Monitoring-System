import pg from "pg";
import { config } from "./config";
import { logger } from "./logger";

const { Pool } = pg

export class PostgresConnection {
    pool: pg.Pool | null;
    constructor() {
        this.pool = null
    }

    getPool(): pg.Pool {
        if (!this.pool) {
            this.pool = new Pool({
                host: config.postgres.host,
                port: config.postgres.port,
                database: config.postgres.database,
                user: config.postgres.user,
                password: config.postgres.password,
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            })
            this.pool.on("error", (err: any) => {
                logger.error("Unexpected error on idle client", err)
                process.exit(-1)
            })
            logger.info("PostgreSQL Pool initialized");
        }
        return this.pool!
    }

    async testConnection() {
        try {
            const pool = this.getPool()
            const client = await pool.connect()
            const result = await client.query("SELECT NOW()");
            client.release()

            logger.info("PostgreSQL connection successful", result.rows[0].now);
        } catch (error) {
            logger.error("PostgreSQL connection failed", error);
            throw error
        }
    }

    async query(text: string, params?: any[]) {
        const pool = this.getPool()
        const start = Date.now();
        try {
            const result = await pool.query(text, params)
            const duration = Date.now() - start;
            logger.info("Query executed", { text, duration, rows: result.rowCount });
            return result;
        } catch (error) {
            logger.error("Query failed", { text, error });
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end()
            logger.info("PostgreSQL connection closed")
        }
    }
}

export const db = new PostgresConnection();
