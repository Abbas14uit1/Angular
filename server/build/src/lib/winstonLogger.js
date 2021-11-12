"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
class Logger {
    constructor() {
        this.logger = new winston.Logger();
    }
    /* istanbul ignore next */
    addFile(config) {
        this.logger.add(winston.transports.File, config);
    }
    /* istanbul ignore next */
    addConsole(config) {
        const defaultConfig = {
            colorize: true,
            humanReadableUnhandledException: true,
            prettyPrint: true,
            timestamp: true,
        };
        this.logger.add(winston.transports.Console, Object.assign(defaultConfig, config));
    }
    /* istanbul ignore next */
    log(level, msg) {
        this.logger.log(level, msg);
    }
}
exports.Logger = Logger;
exports.winstonLogger = new Logger();
//# sourceMappingURL=winstonLogger.js.map