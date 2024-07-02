import { ValidationError } from "express-validator";
import winston from "winston";
import "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

// Ensure the logs directory exists
const logDirectory = path.resolve("logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

enum LogLevel {
  Error = "error",
  Warn = "warn",
  Info = "info",
  Debug = "debug",
  SysInfo = "sysinfo",
}

winston.addColors({
  error: "bold red",
  warn: "bold yellow",
  info: "bold green",
  debug: "bold magenta",
  sysinfo: "bold cyan",
});

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`,
  ),
);

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: logFormat,
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
    logger.log(LogLevel.SysInfo, message);
  }
}
