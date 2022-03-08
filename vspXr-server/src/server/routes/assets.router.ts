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

const router = Router();
const assetRouter = Router();



assetRouter.get('/icon', async (req, res, next) => {
    const vsix = res.locals.vsix as Vsix;
    join(process.env.PACKAGE_STORAGE_PATH, vsix.publisher, vsix.id, 'icon.')
})


router.use('/:id', async (req, res, next) => {
    const vsix = await database.vsix.get(req.params.id)

    if (!vsix) {
        return next(new NotFound())
    }

    res.locals.vsix = vsix;
    next();
}, assetRouter);




export default router;