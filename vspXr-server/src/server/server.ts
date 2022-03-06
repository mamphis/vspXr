import express, { Application, json, urlencoded, Request, Response, NextFunction } from "express";
import { NotFound, isHttpError } from 'http-errors';
import { LogManager, LogLevel } from "../lib/logger";

export class Server {
    private app: Application;
    private logger = LogManager.getLogger('Server');

    constructor(private port: number) {
        this.app = express();
    }

    async init(): Promise<void> {
        this.app.use(json());
        this.app.use(urlencoded({
            extended: false,
        }));

        this.app.use(LogManager.express());
        this.app.use((req, res, next) => {
            next(new NotFound(`${req.path} was not found.`));
        });

        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            if (isHttpError(err)) {
                return res.status(err.status).json(err);
            }

            return res.status(500).send(err);
        });
    }
    start() {
        this.app.listen(this.port, () => {
            this.logger.info(`Started server on port ${this.port}`);
        });
    }
}