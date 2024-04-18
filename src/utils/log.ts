import winston from "winston";
import "winston-daily-rotate-file";

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
    logger.log(LogLevel.Info, message);
  }

  static error(message: string, error?: Error) {
    const errorMsg = error ? `${message} | ${error.stack}` : message;
    logger.log(LogLevel.Error, errorMsg);
  }

  static warn(message: string) {
    logger.log(LogLevel.Warn, message);
  }

  static debug(message: string) {
    logger.log(LogLevel.Debug, message);
  }

  static sysInfo(message: string) {
    logger.log(LogLevel.SysInfo, message);
  }
}
