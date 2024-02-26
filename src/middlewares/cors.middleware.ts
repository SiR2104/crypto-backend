import cors from "cors";
import {corsOptions} from "../types";
const corsOptions: corsOptions = {
    methods: ["POST","GET"],
    optionsSuccessStatus: 200,
    credentials: true,
    origin: [
        "/\.hhbc\.ru$/",
        "https://hospitality.hhbc.ru",
        "https://api.hhbc.ru",
        "https://ad.hhbc.ru",
        "https://hhbc.ru",
        "http://localhost:8000",
        "http://localhost:3000",
        "http://192.168.0.15:3000",
        "http://192.168.1.42:3000"]
}
export default cors(corsOptions);