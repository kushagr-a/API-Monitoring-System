import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "./logger";

/**
 * @fileoverview MongoDB connection configuration and management.
 * This module provides a singleton class to handle the lifecycle of the MongoDB connection
 * using Mongoose, including connecting, disconnecting, and error handling.
 */

/**
 * MongoConnection class responsible for managing the MongoDB database connection lifecycle.
 * It provides methods to initialize, maintain, and terminate the connection with the database.
 */
class MongoConnection {
    /**
     * Holds the Mongoose instance after a successful connection.
     * Initialized as null and updated upon connection.
     * @type {typeof mongoose | null}
     * @private
     */
    private connection: typeof mongoose | null = null;

    /**
     * Initializes a new instance of the MongoConnection class.
     */
    constructor() { }

    /**
     * Establishes a connection to the MongoDB database using parameters from the application configuration.
     * If a connection already exists, it returns the existing connection.
     * 
     * @async
     * @returns {Promise<typeof mongoose>} The Mongoose instance upon successful connection.
     * @throws {Error} If the connection fails.
     */
    async connect(): Promise<typeof mongoose> {
        try {
            if (this.connection) {
                logger.info("MongoDB already connected");
                return this.connection;
            }

            // Connect to MongoDB using the URI and DB name from the configuration
            this.connection = await mongoose.connect(config.mongo.uri, {
                dbName: config.mongo.dbName
            });

            logger.info(`MongoDB connected successfully to "${config.mongo.dbName}"`);

            /**
             * Register connection-level event listeners.
             */
            mongoose.connection.on("error", (error: Error) => {
                logger.error("MongoDB runtime connection error:", error);
                // In some architectures, it might be preferred to emit an event or attempt reconnection
            });

            mongoose.connection.on("disconnected", () => {
                logger.warn("MongoDB connection was disconnected.");
            });

            return this.connection;
        } catch (error) {
            logger.error("Failed to connect to MongoDB:", error);
            throw error;
        }
    }

    /**
     * Safely terminates the MongoDB connection.
     * 
     * @async
     * @returns {Promise<void>}
     * @throws {Error} If there's an error during the disconnection process.
     */
    async disconnect(): Promise<void> {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                logger.info("MongoDB connection closed successfully.");
            }
        } catch (error) {
            logger.error("Error while disconnecting from MongoDB:", error);
            throw error;
        }
    }

    /**
     * Retrieves the current Mongoose instance.
     * 
     * @returns {typeof mongoose | null} The current Mongoose instance or null if not connected.
     */
    getConnection(): typeof mongoose | null {
        return this.connection;
    }
}

/**
 * Singleton instance of MongoConnection to be used throughout the application.
 */
export default MongoConnection
