import winston from "winston";

// Centralized logger configuration used across the application
// to provide consistent and readable pipeline output.
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message }) => message)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

