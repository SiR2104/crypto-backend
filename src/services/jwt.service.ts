import Jwt from "jsonwebtoken";
import {Response} from "express";
import {authRequest, jwtPayload, tokens} from "../types";
import Errors from "../controllers/error.controller";

export default new class {
    signToken(payload: jwtPayload): string | undefined
    {
        if (!payload) return;
        const time = process.env[(payload.type === "refresh")?"REFRESH_TIME":"ACCESS_TIME"] ?? "1800s";
        return Jwt.sign(payload, process.env.TOKEN_SECRET as string,{ expiresIn: time })
    }
    async verifyToken(token?: string): Promise<jwtPayload | undefined>
    {
        if (!token) return;
        try
        {
            return await new Promise<jwtPayload | undefined>((resolve, reject) => {
                Jwt.verify(token, process.env.TOKEN_SECRET as string, ((error, decoded) => {
                    if (error) reject();
                    const token: jwtPayload = decoded as jwtPayload;
                    resolve(token);
                }));
            });
        }
        catch (e)
        {
            return;
        }
    }
    async refreshToken(req: authRequest, res: Response): Promise<tokens | Errors>
    {
        if (!req) return Errors.badRequest("Системная ошибка");
        const cookieToken: {[key:string]:string} = req.cookies;
        const refresh: string | undefined = cookieToken && cookieToken["refresh_token"];
        if (!refresh) return Errors.notAuth();
        const tokenValid = refresh && await this.verifyToken(refresh);
        if (tokenValid && tokenValid.type === "refresh")
        {
            const tokenPayload: jwtPayload = {
                user_name: tokenValid.user_name,
                full_name: tokenValid.full_name,
                role: tokenValid.role,
                type: "access",
            }
            const tokensData: tokens = {
                access: this.signToken({...tokenPayload, type: "access"}),
                refresh: this.signToken({...tokenPayload, type: "refresh"}),
            };
            res.cookie("refresh_token", tokensData.refresh, {path: "/auth/refresh",httpOnly: true});
            return tokensData;
        }
        else
        {
            res.cookie("refresh_token", null, {path: "/auth/refresh",httpOnly: true});
            return Errors.notAuth();
        }
    }
    async checkAccessToken(token: string): Promise<jwtPayload | Errors> {
        const data = await this.verifyToken(token);
        if (data && data.type === "access") {
            return data;
        } else {
            return Errors.notAuth("Need to refresh");

        }
    }
}