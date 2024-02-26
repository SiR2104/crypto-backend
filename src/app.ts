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
dotenv.config();
const port = process.env.PORT || 9000;
const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(dbMiddleware);
app.use(jwtMiddleware);
app.use("/auth",authRouter);
app.use("/share",express.static("views/public"));
app.use(errorMiddleware);
app.use(((_, res) =>
    res.status(404).json({message: "API path not found"})))
const dateService = new DateService();
app.listen(port, ()=>console.log(`App started at:
 non secure: http://${os.hostname()}:${port}
 secure: https://${os.hostname()}:${port}
 locale date: ${dateService.date}
 time: ${dateService.time}
 `));


