import { Router, Request, Response, NextFunction } from "express";
import { readFile, stat } from "fs/promises";
import { NotFound, BadRequest, InternalServerError } from 'http-errors';
import { VsixManager } from "../../lib/vsix";
import multer from "multer";
import { database } from "../..";
import { Like } from "typeorm";
import { compare } from 'semver';
import { join } from "path";
import { Vsix } from "../../model/vsix";
import { LogManager } from "../../lib/logger";

const router = Router();
const assetRouter = Router();
const logger = LogManager.getLogger('AssetRouter');

assetRouter.get('/icon', async (req, res, next) => {
    const vsix = res.locals.vsix as Vsix;
    const iconFileName = join(process.cwd(), vsix.icon);
    const iconStat = await stat(iconFileName).catch(() => { logger.warn('Cannot find asset: ' + iconFileName); next(new NotFound()) });
    if (iconStat) {
        return res.sendFile(iconFileName);
    }
});

router.use('/:id', async (req, res, next) => {
    const vsix = await database.vsix.get(req.params.id)

    if (!vsix) {
        return next(new NotFound())
    }
    logger.debug('found vsix "' + vsix.id + '": ' + vsix.name);

    res.locals.vsix = vsix;
    next();
}, assetRouter);

export default router;