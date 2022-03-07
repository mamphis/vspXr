import { Router, Request, Response, NextFunction } from "express";
import { readFile } from "fs/promises";
import { BadRequest, InternalServerError } from 'http-errors';
import { VsixManager } from "../../lib/vsix";
import multer from "multer";

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

        return res.json(await VsixManager.the.store(req.file, vsix));
    } catch (e: any) {
        return next(new InternalServerError(e));
    }
});


export default router;