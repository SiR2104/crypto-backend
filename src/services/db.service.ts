import {ConnectionConfig, createPool, Pool} from "mysql";

class DbService {
    private readonly _mysql: Pool;
    private readonly _connectionConfig;
    constructor() {
        const {MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE} = process.env;
        const connectionConfig: ConnectionConfig = {
            host: MYSQL_HOST,
            user: MYSQL_USER,
            password: MYSQL_PASSWORD,
            database: MYSQL_DATABASE,
            insecureAuth: true,
            debug:false
        }
        this._connectionConfig = connectionConfig;
        this._mysql = createPool(connectionConfig);
    }

    private async tryConnect(sql: string, values?: unknown):Promise<unknown>
    {
        return await new Promise<unknown>((resolve, reject) => {
            try {
                this._mysql.getConnection(((err, connection) => {
                    connection?.query(sql, values, (error, results) => {
                        connection.release();
                        if (error)
                        {
                            reject(error);
                        }
                        resolve(results);
                    });
                }));
            }
            catch (e)
            {
                console.log(e);
                reject(e);
            }
        });
    }


    async query(sql: string, values?: string[] | object): Promise<unknown> {
        try
        {
            return await this.tryConnect(sql, values);
        }
        catch (e)
        {
            console.log(e);
        }
    }


}

export {DbService}