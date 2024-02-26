import {NextFunction, Request, Response} from "express";
import {authRequest} from "../types";
import Errors from "../controllers/error.controller";

export default async function (req: Request, res: Response, next: NextFunction) {
    const auth: authRequest = req as unknown as authRequest;
    if (auth.user && auth.user.role.includes("x"))
    {
        return next();
    }
    return next(Errors.notAuth());
}