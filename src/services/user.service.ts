import {DbService} from "./db.service";
import Errors from "../controllers/error.controller";
import { db_result, tokens, user} from "../types";
import * as crypto from "crypto";
import JwtService from "./jwt.service";

export default new class {
    genHash(password: string): string | undefined
    {
        if (password) {
            return crypto.createHash("md5").update(password).digest("hex");
        }
    }

    async auth(params:user, con?: DbService): Promise<Errors |(tokens & Pick<user, "user_name" | "full_name" | "rights">)>
    {
        const {user,password} = params;
        if (!user || !password || !params || !con) return Errors.badRequest("Отсутствуют необходимые параметры");
        const hash = this.genHash(`${password} sign: ${process.env.PASSWORD_SECRET}`);
        const potentialUser = await this.userExist(con, user);
        if (!potentialUser)
        {
            return Errors.badRequest("User not found.");
        }
        const data:user[] = await con.query(
            "SELECT user_name, rights, enabled, full_name FROM users WHERE `user_name` = ? AND `password` = ?",
            [user.toLowerCase(),hash])  as user[];
        if (data && data.length > 0) {
            const user:user | undefined = data.pop();
            if (user && !user.enabled) {
                return Errors.badRequest("User is disabled.");
            }
            if (user) return <(tokens & Pick<user, "user_name" | "full_name" | "rights">)>{
                user_name: user.user_name,
                rights: JSON.parse(user.rights.toString()),
                full_name: user.full_name,
                access: JwtService.signToken({
                    user_name: user.user_name,
                    type: "access",
                    role: JSON.parse(user.rights.toString()),
                    full_name: user.full_name
                }),
                refresh: JwtService.signToken({
                    user_name: user.user_name,
                    type: "refresh",
                    role: JSON.parse(user.rights.toString()),
                    full_name: user.full_name
                })
            }
        }
        return Errors.badRequest("Incorrect password.");
    }

    async userExist(con: DbService, user_name: string): Promise<boolean>
    {
        const user = await con.query("SELECT COUNT(*) as cnt FROM users WHERE `user_name` = ?",[user_name.toLowerCase()]) as user[];
        if (user && user.length > 0)
        {
            const existData: any = user && user.length>0 && user.pop();
            if (existData.hasOwnProperty("cnt") && existData["cnt"] > 0)
            {
                return true;
            }

        }
        return false;
    }

    async new(params:user, con?: DbService): Promise<boolean | Errors>
    {
       if (!params || !con) return false;
       const {user_name,full_name,password} = params;
       const hash = this.genHash(`${password} sign: ${process.env.PASSWORD_SECRET}`);
       if (!hash)
       {
           return Errors.badRequest("Fail to save password");
       }
       const potential = await this.userExist(con, user_name);
       if (potential)
       {
           return Errors.badRequest("User already exists.");
       }
       try
       {
            const newUser: db_result = await con.query("INSERT INTO users VALUES(DEFAULT,?,?,?,DEFAULT, DEFAULT)",[user_name.toLowerCase(),hash ?? "",full_name ?? ""]) as db_result;
            return (newUser && newUser.hasOwnProperty("affectedRows") && newUser.affectedRows > 0)
       }
       catch (e: any)
       {
           if (e && e.hasOwnProperty("code") && e.code === "ER_DUP_ENTRY")
           {
               return Errors.badRequest("User already exists.");
           }
           return false;
       }
    }

    async edit(params:user, con?: DbService): Promise<boolean | Errors>
    {
        const {user,enabled,user_name,full_name,password} = params;
        if (!params || !con || !user) return false;
        const values: {[key: string]:unknown} = {
            ...(user_name)?{user_name}:{},
            ...(password)?{password:this.genHash(`${password} sign: ${process.env.PASSWORD_SECRET}`)}:{},
            ...(full_name)?{full_name}:{},
            ...(typeof enabled !== "undefined")?{enabled}:{},
            user
        }
        const potential = await this.userExist(con, user);
        if (potential) {
            delete values["user"];
            const keys = Object.keys(values);
            const sqlKeys = keys.map(item => `${item} = ?`).join(", ")
            const updated: db_result = await con.query(
                `UPDATE users SET ${sqlKeys} WHERE \`user_name\` = '${user}'`,
                keys.map(item => values[item])) as db_result;
            return  (updated && updated.hasOwnProperty("changedRows") && updated.changedRows > 0);
        }
        return Errors.badRequest("User does not exists.");
    }

    async grant(params:user, con?: DbService): Promise<boolean | Errors>
    {
        const {rights, user} = params;
        if (!params || !con || !user) return false;
        const potential = await this.userExist(con, user);
        const rightRights = rights.filter((item)=> ["r","w","x"].includes(item));
        if (potential)
        {
            const updated: db_result = await con.query(
                `UPDATE users SET rights = ? WHERE \`user_name\` = '${user}'`, [JSON.stringify(rightRights)]) as db_result;
            return  (updated && updated.hasOwnProperty("changedRows") && updated.changedRows > 0);
        }
        return Errors.badRequest("User does not exists.");
    }

    async delete(params:user, con?: DbService): Promise<boolean | Errors>
    {
        const {user} = params;
        if (!params || !con || !user) return false;
        const potential = await this.userExist(con, user);
        if (potential)
        {
            const data: db_result = await con.query("DELETE FROM users WHERE \`user_name\` = ?",[user]) as db_result;
            return (data && data.affectedRows > 0);
        }
        return Errors.badRequest("User does not exists.");
    }
}