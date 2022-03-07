import { LogLevel } from "./loglevel";
import { LogManager } from "./logmanager";

export class Logger {
    constructor(private logManager: LogManager, public readonly className: string) {

    }

    private log(level: LogLevel, message: string, ...args: any[]) {
        this.logManager.write(level, `(${this.className}): ${message}`);
    }

    verbose(message: string, ...args: any[]) {
        this.log(LogLevel.Verbose, message, ...args);
    }

    debug(message: string, ...args: any[]) {
        this.log(LogLevel.Debug, message, ...args);
    }

    info(message: string, ...args: any[]) {
        this.log(LogLevel.Info, message, ...args);
    }

    warn(message: string, ...args: any[]) {
        this.log(LogLevel.Warn, message, ...args);
    }

    error(message: string, ...args: any[]): void;
    error(error: Error): void;
    error(message: string | Error, ...args: any[]): void {
        if (typeof message === 'string') {
            this.log(LogLevel.Error, message, ...args);
        } else {
            this.log(LogLevel.Error, `${message.name}: ${message.message}`);
        }
    }

    fatal(message: string, ...args: any[]) {
        this.log(LogLevel.Fatal, message, ...args);
    }
}
