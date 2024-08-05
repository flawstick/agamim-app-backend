import { Request, Response, NextFunction } from "express";
import chalk from "chalk";
import { log } from "@/utils/log";

const MAX_URL_LENGTH = 100;

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startTime = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationInMilliseconds = (seconds * 1000 + nanoseconds / 1e6).toFixed(
      3,
    );

    const method = chalk.blue(req.method);
    let url = req.path;

    if (url.length > MAX_URL_LENGTH) {
      url = `${url.substring(0, MAX_URL_LENGTH)}...`;
    }

    const formattedUrl = chalk.magenta(url);
    const status =
      res.statusCode >= 400
        ? chalk.red(res.statusCode.toString())
        : chalk.green(res.statusCode.toString());
    const responseTime = chalk.yellow(`${durationInMilliseconds}ms`);

    log.sysInfo(`${method} ${formattedUrl} ${status} - ${responseTime}`);
  });

  next();
};
