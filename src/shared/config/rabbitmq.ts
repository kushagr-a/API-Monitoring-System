import amqp from "amqplib";
import { config } from "./config";
import { logger } from "./logger";

class RabbitMQConnection {
    connection: amqp.ChannelModel | null;
    channel: amqp.Channel | null;
    isConnecting: boolean;

    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    async connect(): Promise<amqp.Channel> {
        if (this.channel) {
            return this.channel;
        }

        // Handle concurrent connection requests
        if (this.isConnecting) {
            await new Promise<void>((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
            
            // TypeScript needs to know the channel wasn't set to null if the connection failed
            if (!this.channel) {
                throw new Error("Failed to connect to RabbitMQ while waiting");
            }
            return this.channel;
        }

        try {
            this.isConnecting = true;

            logger.info("Connecting to RabbitMQ", config.rabbitmq.url);
            this.connection = await amqp.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            // Creating key | Queue name
            const dlqName = `${config.rabbitmq.queue}.dlq`; // e.g., api_hits.dlq

            // DL Queue
            await this.channel.assertQueue(dlqName, {
                durable: true
            });

            // Normal Queue 
            await this.channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName
                }
            });

            logger.info("RabbitMQ connected, queue:", config.rabbitmq.queue);

            this.connection.on("close", () => {
                logger.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
            });

            this.connection.on("error", (err) => {
                logger.error('RabbitMQ connection err', err);
                this.connection = null;
                this.channel = null;
            });

            this.isConnecting = false;
            return this.channel;
        } catch (error) {
            this.isConnecting = false;
            logger.error("Failed to connect to RabbitMQ", error);
            throw error;
        }
    }

    getChannel(): amqp.Channel | null {
        return this.channel;
    }

    getStatus(): "disconnected" | "connected" {
        // FIX: Replaced 'this.connect' with 'this.connection'.
        // Removed '.closing' as it's not a standard property on amqplib's Connection interface.
        if (!this.connection || !this.channel) {
            return "disconnected";
        }
        return "connected";
    }

    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }

            logger.info("RabbitMQ connection closed");
        } catch (error) {
            logger.error("Error in closing RabbitMQ connection:", error);
        }
    }
}

export default new RabbitMQConnection();