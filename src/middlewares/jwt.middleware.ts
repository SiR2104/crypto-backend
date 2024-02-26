import {NextFunction, RequestHandler, Response} from "express";
import {authRequest} from "../types";
import jwtService from "../services/jwt.service";

async function jwtMiddleware(req: authRequest, res: Response, next: NextFunction) {
    const authRaw: string | null = req.headers.authorization;
    if (authRaw)
    {
        const [_,token] = authRaw.split(" ");
        try
        {
            const verifiedToken = await jwtService.verifyToken(token);
            if (verifiedToken)
            {
                req.user = verifiedToken;
            }
        }
        catch (e)
        {
            //console.log(e);
        }
    }
    next();
}

export default jwtMiddleware as unknown as RequestHandler;