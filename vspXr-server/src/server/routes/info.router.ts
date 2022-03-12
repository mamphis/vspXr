import { NextFunction, Request, Response, Router } from "express";
import { read } from 'pkginfo';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const pckg = read(module);
    return res.json({
        name: process.env.REGISTRY_NAME,
        version: pckg.package.version,
    });
});


export default router;