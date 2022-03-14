import dotenv from 'dotenv';
dotenv.config();

import { mkdir } from 'fs/promises';
import { Database, SqlJsDatabase } from "./data/";
import { } from './data/impl/sqljs';
import { addConsoleAppender } from "./lib/logger";
import { Server } from "./server/server";


// Add console appender to the logger
addConsoleAppender();
let database: Database;
async function start() {
    // Create a server and a database
    const server = new Server(process.env.SERVER_PORT);
    database = new SqlJsDatabase(process.env.SQLJS_DATABASE)

    // Initialize the database
    await database.init();

    // Make the assets directory
    await mkdir(process.env.ASSET_PATH, { recursive: true });

    // Start the server
    await server.init();
    await server.start();
}

start();

export { database };
