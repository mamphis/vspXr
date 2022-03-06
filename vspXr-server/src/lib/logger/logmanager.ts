import { Handler } from "express";
import moment from "moment";
import { Appender } from "./appender";
import { ConsoleAppender } from "./consoleappender";
import { Logger } from "./logger";
import { LogLevel } from "./loglevel";

export class LogManager {

    private static instance: LogManager;
    static get the(): LogManager {
        if (!this.instance) {
            this.instance = new LogManager();
        }

        return this.instance;
    }

    minimumLogLevel: LogLevel = LogLevel.Info;
    private appenders: Appender[] = [];

    private constructor() {
    }

    static getLogger(className: string): Logger {
        const logger = new Logger(LogManager.the, className);

        return logger;
    }

    static express(expressOptions: {
        level: LogLevel,
        className: string
    } = { level: LogLevel.Info, className: 'Request' }): Handler {
        return async (req, res, next) => {
            const start = moment();
            await next();
            let logMessage = `(${expressOptions.className}): ${req.method} ${req.path} took ${moment().diff(start)}ms => ${res.statusCode}`;
            if (LogManager.the.minimumLogLevel <= LogLevel.Debug) {
                logMessage += ` [Requester: ${req.ip}, Hostname: ${req.hostname}, Statusmessage: ${res.statusMessage}]`
            }

            LogManager.the.write(expressOptions.level, logMessage);
        }
    }

    write(level: LogLevel, message: string) {
        if (level >= this.minimumLogLevel) {
            this.appenders.forEach(appender => appender.write(level, message));
        }
    }

    addAppender(appender: Appender) {
        this.appenders.push(appender);
    }
}

export function addConsoleAppender() {
    const appender = new ConsoleAppender();
    LogManager.the.addAppender(appender);
}