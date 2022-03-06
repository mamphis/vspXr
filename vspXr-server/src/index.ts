import { Database } from "./data/database";
import { addConsoleAppender } from "./lib/logger";
import { Server } from "./server/server";

addConsoleAppender();
let database: Database;
async function start() {
    const server = new Server(8000);


    await server.init();
    await server.start();
}

start();

export { database };