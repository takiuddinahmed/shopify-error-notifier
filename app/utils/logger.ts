import winston from "winston";
import LokiTransport from "winston-loki";
import path from "path";
import fs from "fs";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }),
);

// Create logger
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new LokiTransport({
      host: "http://localhost:3100",
      labels: { app: "notifier-app" },
      json: true,
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: path.join("logs", "app.log"), // Store logs in a local file
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error", // Only store errors here
    }),
  ],
});

// Ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export default logger;
