import { ValidationError } from "express-validator";
import winston from "winston";
import "winston-daily-rotate-file";

winston.addColors({
  error: "bold red",
  warn: "bold yellow",
  info: "bold green",
  debug: "bold magenta",
  verbose: "bold cyan", // Use verbose for system messages
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} [${
        info.level === "verbose" ? "system" : info.level
      }]: ${info.message}`,
  ),
);

const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    verbose: 4, // Include verbose level
  },
  format: logFormat,
  level: "verbose", // Set to verbose to include verbose level
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export class log {
  static info(message: string) {
    logger.info(message);
  }

  static error(message: string, error?: Error) {
    const errorMsg = error ? `${message} | ${error.stack}` : message;
    logger.error(errorMsg);
  }

  static warn(message: string, error?: Error | ValidationError[]) {
    if (error instanceof Array)
      logger.warn(`${message} | ${error.map((e) => e.msg).join(", ")}`);
    else logger.warn(`${message} | ${error}`);
  }

  static debug(message: string) {
    logger.debug(message);
  }

  static sysInfo(message: string) {
    logger.verbose(message); // Use verbose for system messages
  }
}
