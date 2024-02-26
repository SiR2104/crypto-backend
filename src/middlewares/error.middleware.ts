import {NextFunction, Request, Response} from "express";
import Errors from "../controllers/error.controller";

export default async function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof Errors)
    {
        return res.status(err.status).json({message:err.message});
    }
    next();
}