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
    const iconStat = await stat(iconFileName).catch(() => { logger.warn('Cannot find icon: ' + iconFileName); next(new NotFound()); });
    if (iconStat) {
        return res.sendFile(iconFileName);
    }
});

assetRouter.get('/latest', async (req, res, next) => {
    const vsix = res.locals.vsix as Vsix;

    const latestVersion = vsix.versions.sort((c1, c2) => compare(c2.version, c1.version))[0];

    const vsixFileName = join(process.env.PACKAGE_STORAGE_PATH, vsix.publisher, vsix.id, latestVersion.filename);

    const vsixStat = await stat(vsixFileName).catch(() => { logger.warn('Cannot find latest extension: ' + vsixFileName); next(new NotFound()); });

    if (vsixStat) {
        return res.sendFile(vsixFileName, { root: process.cwd() });
    }
});

assetRouter.get('/:version', async (req, res, next) => {
    const vsix = res.locals.vsix as Vsix;

    const version = vsix.versions.find(v => v.version === req.params.version);

    if (!version) {
        return next(new NotFound(`${vsix.id} was not found in the specified version: ${req.params.version}`));
    }

    const vsixFileName = join(process.env.PACKAGE_STORAGE_PATH, vsix.publisher, vsix.id, version.filename);

    const vsixStat = await stat(vsixFileName).catch(() => { logger.warn('Cannot find latest extension: ' + vsixFileName); next(new NotFound()); });

    if (vsixStat) {
        return res.sendFile(vsixFileName);
    }
});

router.use('/:id', async (req, res, next) => {
    const vsix = await database.vsix.get({ where: { id: req.params.id } })

    if (!vsix) {
        return next(new NotFound())
    }
    logger.debug('found vsix "' + vsix.id + '": ' + vsix.name);

    res.locals.vsix = vsix;
    next();
}, assetRouter);

export default router;