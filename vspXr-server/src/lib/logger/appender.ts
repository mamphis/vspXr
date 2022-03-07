import { LogLevel } from "./loglevel";

export interface Appender {
    write(level: LogLevel, message: string): void;
}