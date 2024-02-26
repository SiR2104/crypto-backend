import {NextFunction, Request, Response} from "express";
import {authRequest, jwtPayload, tokens, user} from "../types";
import {validationResult} from "express-validator";
import Errors from "./error.controller";
import jwtService from "../services/jwt.service";
import userService from "../services/user.service";

export default new class {
    async auth(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            if (!validationResult(req).isEmpty())
                Errors.handleError(Errors.badRequest("Bad params"));
            const auth: authRequest = req as unknown as authRequest;
            const authExist: (tokens &
                Pick<user, "user_name" | "full_name" | "rights">) |
                Errors = await userService.auth(req.body, auth.db);
            if (authExist instanceof Errors)
            {
                Errors.handleError(authExist);
            }
            else if (authExist)
            {
                res.cookie("refresh_token",authExist.refresh,{path: "/auth/refresh",httpOnly:true});
                const {user_name, full_name, rights, access} = authExist;
                return res.status(200).json({
                    "message": "success",
                    "user_name": user_name,
                    "full_name": full_name,
                    "rights": rights,
                    "access_token": access
                });
            }
            Errors.handleError(Errors.badRequest("Authorization error"));
        }
        catch (e: any)
        {
            next(e);
        }
    }

    async refresh(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            const refresh = await jwtService.refreshToken(req as unknown as authRequest,res);
            if (refresh instanceof Errors)
            {
                Errors.handleError(refresh);
            }
            else if (refresh)
            {
                const access: jwtPayload | Errors = await jwtService.checkAccessToken(refresh.access ?? "");
                if (access instanceof Errors)
                {
                    Errors.handleError(access);
                }
                else
                return res.status(200).json({
                    message: "Refresh success.",
                    access_token: refresh.access,
                    user_name: access.user_name,
                    full_name: access.full_name,
                    rights: access.role
                });
            }
            else
            {
                Errors.handleError(Errors.notAuth());
            }
        }
        catch (e: any)
        {
            next(e)
        }
    }

    async new(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            if (!validationResult(req).isEmpty())
                Errors.handleError(Errors.badRequest("Bad params"));
            const auth: authRequest = req as unknown as authRequest;
            const potentialUser = await userService.new(req.body, auth.db);
            if (potentialUser instanceof Errors)
            {
                Errors.handleError(potentialUser);
            }
            return res.status(200).json({message: "user created."})
        }
        catch (e: any)
        {
            console.log(e.message);
            next(e)
        }
    }

    async edit(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            if (!validationResult(req).isEmpty())
                Errors.handleError(Errors.badRequest("Bad params"));
            const auth: authRequest = req as unknown as authRequest;
            const editedUser = await userService.edit(req.body, auth.db);
            if (editedUser instanceof Errors)
            {
                Errors.handleError(editedUser);
            }
            return res.status(200).json({message: `user ${(editedUser)?"":"not "}modified.`})
        }
        catch (e: any)
        {
            console.log(e.message);
            next(e)
        }
    }

    async grant(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            if (!validationResult(req).isEmpty())
                Errors.handleError(Errors.badRequest("Bad params"));
            const auth: authRequest = req as unknown as authRequest;
            const rightsChanged = await userService.grant(req.body, auth.db);
            if (rightsChanged instanceof Errors)
            {
                Errors.handleError(rightsChanged);
            }
            return res.status(200).json({message: `rights ${(rightsChanged)?"":"not "}changed.`})
        }
        catch (e: any)
        {
            console.log(e.message);
            next(e)
        }
    }

    async delete(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            if (!validationResult(req).isEmpty())
                Errors.handleError(Errors.badRequest("Bad params"));
            const auth: authRequest = req as unknown as authRequest;
            const deletedUser = await userService.delete(req.body, auth.db);
            if (deletedUser instanceof Errors)
            {
                Errors.handleError(deletedUser);
            }
            return res.status(200).json({message: `user is ${(deletedUser)?"":"not "}removed.`})
        }
        catch (e: any)
        {
            console.log(e.message);
            next(e)
        }
    }

    async logout(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            res.cookie("refresh_token",null,{path: "/auth/refresh",httpOnly:true});
            return res.status(200).json({message: `User logoff`})
        }
        catch (e: any)
        {
            console.log(e.message);
            next(e)
        }
    }

    async checkAccessToken(req: Request,res: Response, next: NextFunction)
    {
        try
        {
            const rawHeader: string | undefined = req.headers?.authorization;
            const token = (rawHeader) && rawHeader.split(" ");
            if (token && token?.length === 2 && token[0].toLowerCase() === "bearer")
            {
                const accessToken: string = token[1];
                const access = await jwtService.checkAccessToken(accessToken);
                if (access instanceof Errors)
                {
                    Errors.handleError(access);
                }
                else if (access)
                {
                    const {user_name,full_name,role} = access;
                    return res.status(200).json({
                        message: "Check success.",
                        "user_name": user_name,
                        "full_name": full_name,
                        "rights": role,
                    });
                }
                else
                {
                    Errors.handleError(Errors.notAuth());
                }
            }
            Errors.handleError(Errors.badRequest("Token failed"));
        }
        catch (e)
        {
            next(e)
        }
    }
}