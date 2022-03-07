import { Router, Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { BadRequest, InternalServerError } from 'http-errors';
import { VsixManager } from "../../lib/vsix";
import multer from "multer";
import { database } from "../..";
import { Like } from "typeorm";

const router = Router();


const upload = multer({ dest: process.env.TEMP_UPLOAD_PATH });
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
        }
    } catch (e: any) {
        return next(new InternalServerError(e));
    }
});

router.get('/', async (req, res, next) => {
    return res.json([{
        id: '1',
        name: 'string',
        description: 'string',
        publisher: 'string',
        version: 'string'
    }, {
        id: '2',
        name: 'modus-elo-dev',
        description: 'string',
        publisher: 'modus',
        version: '0.1.0'
    },
    ])
    const searchQuery = req.query.query;
    res.json(await database.vsix.find({
        where: [
            { name: Like(`%${searchQuery}%`) },
            { publisher: Like(`%${searchQuery}%`) }
        ]
    }).catch(next));
});


export default router;