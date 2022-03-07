import moment from "moment";
import { Appender } from "./appender";
import { LogLevel } from "./loglevel";

export class ConsoleAppender implements Appender {
    constructor() {

    }

    write(level: LogLevel, message: string): void {
        const msgToLog = `${moment().format('DD.MM.YY HH:mm:ss.SSS')} [${LogLevel[level]}]: ${message}`;
        switch (level) {
            case LogLevel.Verbose:
            case LogLevel.Debug:
            case LogLevel.Info:
                console.log(msgToLog);
                break;
            case LogLevel.Warn:
                console.warn(msgToLog);
                break;
            case LogLevel.Error:
            case LogLevel.Fatal:
                console.error(msgToLog);
                break;
        }
    }
}