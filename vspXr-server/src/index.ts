import { addConsoleAppender } from "./lib/logger";
import { Server } from "./server/server";

addConsoleAppender();

async function start() {
    const server = new Server(8000);


    await server.init();
    await server.start();
}

start();