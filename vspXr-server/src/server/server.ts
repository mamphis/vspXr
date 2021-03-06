import cors from 'cors';
import express, { Application, json, NextFunction, Request, Response, urlencoded } from "express";
import { isHttpError, NotFound } from 'http-errors';
import { LogManager } from "../lib/logger";
import assetsRouter from './routes/assets.router';
import infoRouter from './routes/info.router';
import vsixRouter from './routes/vsix.router';

/**
 * The express server
 *
 * @export
 * @class Server
 */
export class Server {
    private app: Application;
    private logger = LogManager.getLogger('Server');

    /**
     * Creates an instance of Server.
     * @param {number} port The port the server will listen
     * @memberof Server
     */
    constructor(private port: number) {
        this.app = express();
    }

    /**
     * Initializes the server; Configure it and set up routes and logger
     *
     * @return {*}  {Promise<void>}
     * @memberof Server
     */
    async init(): Promise<void> {
        this.app.use(json());
        this.app.use(cors());
        this.app.use(urlencoded({
            extended: false,
        }));

        this.app.use(LogManager.express());

        this.app.use('/info', infoRouter);
        this.app.use('/vsix', vsixRouter);
        this.app.use('/assets', assetsRouter);

        this.app.use((req, res, next) => {
            next(new NotFound(`${req.originalUrl} was not found.`));
        });

        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            this.logger.error(err);
            if (isHttpError(err)) {
                return res.status(err.status).json(err);
            }

            return res.status(500).send(err);
        });
    }

    /**
     * Start the server
     *
     * @memberof Server
     */
    start() {
        this.app.listen(this.port, () => {
            this.logger.info(`Started server on port ${this.port}`);
        });
    }
}