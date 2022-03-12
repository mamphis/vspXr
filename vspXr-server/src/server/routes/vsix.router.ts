import { Router, Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { BadRequest, InternalServerError, NotFound } from 'http-errors';
import { VsixManager } from "../../lib/vsix";
import multer from "multer";
import { database } from "../..";
import { Like } from "typeorm";
import { compare } from 'semver';

const router = Router();
const upload = multer({
    dest: process.env.TEMP_UPLOAD_PATH
});
router.use(upload.single('vsix'));

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next(new BadRequest('Missing vsix file.'));
    }

    try {
        const vsixBuffer = await readFile(req.file.path);
        const vsix = await VsixManager.the.parseVsixData(vsixBuffer);

        const version = await VsixManager.the.store(req.file, vsix).catch(err => next(
            new BadRequest(err))
        );

        if (version) {
            return res.json(version);
        } else {
            return next(new InternalServerError('Cannot insert version'));
        }
    } catch (e: any) {
        return next(new InternalServerError(e.toString()));
    }
});

router.get('/', async (req, res, next) => {
    const searchQuery = req.query.query;
    const result = await database.vsix.find({
        where: [
            { name: Like(`%${searchQuery}%`) },
            { publisher: Like(`%${searchQuery}%`) }
        ]
    }).catch(() => next());

    if (result) {
        return res.json(result.map(vsix => {
            const latestVersion = vsix.versions.sort((c1, c2) => compare(c2.version, c1.version))[0];
            return {
                id: vsix.id,
                name: vsix.name,
                description: latestVersion.description,
                publisher: vsix.publisher,
                version: latestVersion.version
            }
        }));
    }
});

router.get('/:id', async (req, res, next) => {
    const extension = await database.vsix.get(req.params.id, { relations: ['versions'] });

    if (!extension) {
        return next(new NotFound());
    }
    extension.versions.forEach(v => { delete v.vsix });

    const latestVersion = extension.versions.sort((c1, c2) => compare(c2.version, c1.version))[0];
    res.json({ ...extension, latestVersion });
})

export default router;