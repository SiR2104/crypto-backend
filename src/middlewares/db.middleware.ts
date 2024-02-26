import {NextFunction, RequestHandler, Response} from "express";
import {authRequest} from "../types";
import {DbService} from "../services/db.service";

 async function dbMiddleware(req: authRequest, res: Response, next: NextFunction) {
    try
    {
       req.db = new DbService();
    }
    catch (e: any)
    {
         console.log(e.message);
    }
    next();
}

export default dbMiddleware as unknown as RequestHandler