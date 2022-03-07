import { Logger, QueryRunner } from "typeorm";
import { LogManager } from ".";
import { Logger as Log } from "./logger";

export class TypeOrmLogger implements Logger {
    private logger: Log;
    constructor(private logManager: LogManager) {
        this.logger = new Log(this.logManager, 'TypeOrm');
    }

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.debug(`Query: ${query} {Parameters: [${parameters?.join(', ')}]}`);
    }
    logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        if (typeof error === 'string') {
            this.logger.error(error);
        } else {
            this.logger.error(error);
        }
    }
    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.debug(`query took a long time (${time}ms) to execute. Query: ${query} {Parameters: [${parameters?.join(', ')}]}`);
    }
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.logger.debug(message);
    }
    logMigration(message: string, queryRunner?: QueryRunner) {
        this.logger.debug(message);
    }
    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner) {
        switch (level) {
            case 'log':
                this.logger.debug(message);
                break;
            case 'info':
                this.logger.info(message);
                break;
            case 'warn':
                this.logger.warn(message);
                break;
        }
    }
}