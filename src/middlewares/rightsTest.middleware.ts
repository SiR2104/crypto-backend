import {NextFunction, Request, Response} from "express";
import {authRequest} from "../types";
import Errors from "../controllers/error.controller";

export default (rights: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    const auth = req as unknown as authRequest;
    if (auth.user && rights.every(value => auth.user?.role.includes(value)))
    {
        return next();
    }
    return next(Errors.notAuth());
}