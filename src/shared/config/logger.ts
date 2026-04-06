import wiston from "winston";
import { config } from "./config";

/**
 * Logger configuration
 */
export const logger = new wiston.Logger({
    level: config.node_env === "production" ? "info" : "debug",
    format: wiston.format.combine(
        wiston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        wiston.format.errors({ stack: true }),
        wiston.format.splat(),
        wiston.format.json()
    ),
    defaultMeta: { service: "api-monitoring" },
    transports: [
        new wiston.transports.File({ filename: "logs/error.log", level: "error" }),
        new wiston.transports.File({ filename: "logs/combined.log" }),
    ],

});

if (config.node_env !== "production") {
    logger.add(new wiston.transports.Console({
        format: wiston.format.combine(
            wiston.format.colorize(),
            wiston.format.simple()
        ),
    }));
}