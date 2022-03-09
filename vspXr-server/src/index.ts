import dotenv from 'dotenv';
import { mkdir } from 'fs/promises';
dotenv.config();

import { Database, SqliteDatabase } from "./data/";
import { SqlJsDatabase } from './data/impl/sqljs';
import { addConsoleAppender } from "./lib/logger";
import { Server } from "./server/server";

addConsoleAppender();
let database: Database;
async function start() {
    const server = new Server(process.env.SERVER_PORT);
    database = new SqlJsDatabase(process.env.SQLJS_DATABASE)

    await database.init();

    await mkdir(process.env.ASSET_PATH, { recursive: true });

    await server.init();
    await server.start();
}

start();

export { database };