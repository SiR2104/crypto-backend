import * as dotenv from "dotenv";
import os from "os";
import bodyParser from "body-parser";
import express from "express";
import corsMiddleware from "./middlewares/cors.middleware";
import jwtMiddleware from "./middlewares/jwt.middleware";
import errorMiddleware from "./middlewares/error.middleware";
import cookieParser from "cookie-parser";
import dbMiddleware from "./middlewares/db.middleware";
import DateService from "./services/date.service";
import authRouter from "./routes/auth.route";
import cryptoService from "./services/crypto.service";
import path from "path";
import Errors from "./controllers/error.controller";
dotenv.config();
const port = process.env.PORT || 9000;
const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(dbMiddleware);
app.use(jwtMiddleware);
app.use("/auth",authRouter);
app.get("/test",(async (_, res) => {
  const test = await cryptoService.cryptFile(path.join("./test.zip"));
  if (test instanceof Errors)
  {
      return Errors.handleError(test);
  }
  const [data, iv, tag] = test;
  console.log(data);
  const dec = await cryptoService.decryptFile(path.join(data),"decrypted.zip", iv, tag);
  console.log(dec);
  return res.status(200).send();
}));
app.use("/share",express.static("views/public"));
app.use(errorMiddleware);
app.use(((_, res) =>
    res.status(404).json({message: "API path not found"})))
const dateService = new DateService();
app.listen(port, ()=>console.log(`App started at:
 secure: https://${os.hostname()}:${port}
 locale date: ${dateService.date}
 time: ${dateService.time}
 `));


