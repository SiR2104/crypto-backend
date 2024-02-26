import {MysqlService} from "./services/mysql.service";

enum rights {
    "r" = 100,
    "w" = 101,
    "x" = 102,
}

type corsOptions = {
    origin: string[],
    optionsSuccessStatus: number,
    methods: string[],
    credentials: boolean
}

type jwtPayload = {
    user_name: string,
    full_name?: string,
    role: string[],
    type: "access" | "refresh",
    iat?: number,
    exp?: number
}

type tokens = {
    refresh?: string,
    access?: string
}

type user = {
    user_name: string,
    password: string,
    full_name?: string,
    rights:  (keyof typeof rights)[],
    enabled: boolean
    user?: string
}

interface authHeaders extends Headers {
   authorization: string;
}

type db_result = {
    affectedRows: number,
    insertId: number,
    changedRows: number
}

interface error {
    code: string,
    message: string
}

interface authRequest extends Request {
    user: jwtPayload | undefined,
    db: MysqlService | undefined,
    cookies: {[key:string]: string}
    headers: authHeaders
}


export {
    type corsOptions,
    type jwtPayload,
    type tokens,
    type user,
    type db_result,
    rights,
    error,
    authRequest,
}