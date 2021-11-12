import * as winston from "winston";

export class Logger {
  private logger: winston.LoggerInstance;
  constructor() {
    this.logger = new winston.Logger();
  }

  /* istanbul ignore next */
  public addFile(config: winston.FileTransportOptions) {
    this.logger.add(winston.transports.File, config);
  }

  /* istanbul ignore next */
  public addConsole(config: winston.ConsoleTransportOptions) {
    const defaultConfig: winston.ConsoleTransportOptions = {
      colorize: true,
      humanReadableUnhandledException: true,
      prettyPrint: true,
      timestamp: true,
    };
    this.logger.add(winston.transports.Console, Object.assign(defaultConfig, config));
  }

  /* istanbul ignore next */
  public log(level: string, msg: string) {
    this.logger.log(level, msg);
  }
}

export const winstonLogger = new Logger();
