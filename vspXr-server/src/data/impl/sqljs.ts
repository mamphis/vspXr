import { createConnection } from "typeorm";
import { LogManager } from "../../lib/logger";
import { Vsix } from "../../model/vsix";
import { VsixVersion } from "../../model/vsixversion";
import { BasicDAO } from "../basicdao";
import { Database, VsixDAO, VsixVersionDAO } from "../database";

export class SqlJsDatabase implements Database {
    vsix: VsixDAO = new BasicDAO(Vsix);
    vsixVersion: VsixVersionDAO = new BasicDAO(VsixVersion);

    constructor(private dataPath: string) {

    }

    async init(): Promise<void> {
        const connection = await createConnection({
            type: 'sqljs',
            location: this.dataPath,
            autoSave: true,
            entities: [
                "out/model/**/*{.ts,.js}",
                // "src/model/**/*{.ts,.js}"
            ],
            logging: ['warn', 'error', 'info'],
            logger: LogManager.typeorm(),
        });


        await connection.query('PRAGMA foreign_keys=OFF');
        await connection.synchronize(false);
        await connection.query('PRAGMA foreign_keys=ON');
    }
}