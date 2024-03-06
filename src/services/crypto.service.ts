import crypto from "crypto";
import Errors from "../controllers/error.controller";
import {createReadStream, createWriteStream} from "fs";
import * as fs from "fs";

export default new class cryptoData {

    crypt(data: string, passwd?: string): [string, Buffer, Buffer] | Errors
    {
        try {
            const iv = Buffer.from(crypto.randomBytes(12));
            const key = Buffer.from(passwd?.padStart(32) ?? process.env.TOKEN_SECRET.padStart(32));
            const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
            const enc = Buffer.from(cipher.update(data, "utf-8", "base64"));
            const encoded = Buffer.concat([enc, Buffer.from(cipher.final("base64"))]).toString();
            return [encoded, iv, cipher.getAuthTag()];
        }
        catch (e)
        {
            console.log(e);
            return Errors.badRequest("Ошибка шифрования данных")
        }
    }

    decrypt(encoded: string, iv: Buffer, tag: Buffer, passwd?: string): string | Errors
    {
        try {
            const key = Buffer.from(passwd?.padStart(32) ?? process.env.TOKEN_SECRET.padStart(32));
            const cipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
            cipher.setAuthTag(tag);
            const dec = cipher.update(encoded, "base64", "utf-8");
            return dec + cipher.final();
        }
        catch (e)
        {
            console.log(e);
            return Errors.badRequest("Ошибка дешифровки данных")
        }
    }

    async cryptFile(path: string, passwd?: string): Promise<[string, Buffer, Buffer] | Errors>
    {
        try {
            if (!fs.existsSync(path))
            {
                return Errors.badRequest("Файл не найден")
            }
            const readStream = createReadStream(path);
            const writeStream = createWriteStream(`${path}.enc`);
            const iv = Buffer.from(crypto.randomBytes(12));
            const key = Buffer.from(passwd?.padStart(32) ?? process.env.TOKEN_SECRET.padStart(32), "utf-8");
            const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
            return await new Promise(((resolve) => {
                readStream.pipe(cipher).pipe(writeStream);
                readStream.on("end",(() => {
                    try {
                        resolve([`${path}.enc`, iv, cipher.getAuthTag()]);
                    }
                    catch (e)
                    {
                        console.log(e.message);
                        resolve(Errors.badRequest("Ошибка шифрования файла"))
                    }
                }));
            }));
        }
        catch (e)
        {
            console.log(e);
            return Errors.badRequest("Ошибка шифрования данных")
        }
    }

    async decryptFileToBuffer(path: string, iv: Buffer, tag: Buffer, passwd?: string): Promise<string | Errors>
    {
        try {
            if (!fs.existsSync(path))
            {
                return Errors.badRequest("Файл не найден")
            }
            const readStream = createReadStream(path);
            const buffers: Buffer[] = [];
            const key = Buffer.from(passwd?.padStart(32) ?? process.env.TOKEN_SECRET.padStart(32), "utf-8");
            const cipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
            cipher.setAuthTag(tag);
            return await new Promise(((resolve) => {
                readStream.pipe(cipher).on("data", (chunk) => {
                    buffers.push(chunk);
                });
                readStream.on("end",(() => {
                    try {
                        resolve(Buffer.concat(buffers).toString());
                    }
                    catch (e)
                    {
                        console.log(e.message);
                        resolve("Ошибка дешифровки файла")
                    }
                }));
            }));
        }
        catch (e)
        {
            console.log(e);
            return Errors.badRequest("Ошибка дешифровки данных")
        }
    }

    async decryptFile(path: string, destinationFileName: string, iv: Buffer, tag: Buffer, passwd?: string): Promise<string | Errors>
    {
        try {
            if (!fs.existsSync(path))
            {
                return Errors.badRequest("Файл не найден")
            }
            const readStream = createReadStream(path);
            const writeStream = createWriteStream(destinationFileName);
            const key = Buffer.from(passwd?.padStart(32) ?? process.env.TOKEN_SECRET.padStart(32), "utf-8");
            const cipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
            cipher.setAuthTag(tag);
            return await new Promise(((resolve) => {
                readStream.pipe(cipher).pipe(writeStream);
                readStream.on("end",(() => {
                    try {
                        resolve(destinationFileName);
                    }
                    catch (e)
                    {
                        console.log(e.message);
                        resolve("Ошибка дешифровки файла")
                    }
                }));
            }));
        }
        catch (e)
        {
            console.log(e);
            return Errors.badRequest("Ошибка дешифровки данных")
        }
    }

}