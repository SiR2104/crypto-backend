import {Router} from "express";
import authController from "../controllers/auth.controller";
import {body} from "express-validator";
import adminTestMiddleware from "../middlewares/adminTest.middleware";
import pdfService from "../services/pdf.service";
import mailService from "../services/mail.service";

const authRouter = Router();

authRouter.post("/login",
    body("user").isString().isLength({min: 3, max: 20}),
    body("password").isString().isLength({min: 3, max: 64}),
    authController.auth);
authRouter.post("/new",
    adminTestMiddleware,
    body("user_name").isString().isLength({min: 3, max: 20}),
    body("password").isString().isLength({min: 3, max: 64}),
    body("full_name").isString().isLength({min: 3, max: 20}),
    authController.new);

authRouter.post("/delete",
    adminTestMiddleware,
    body("user").isString().isLength({min: 3, max: 20}),
    authController.delete);

authRouter.post("/edit",
    adminTestMiddleware,
    body("user").isString().isLength({min: 3, max: 20}),
    body("user_name").optional().isString().isLength({min: 3, max: 20}),
    body("password").optional().isString().isLength({min: 3, max: 64}),
    body("full_name").optional().isString().isLength({min: 3, max: 20}),
    body("enabled").optional().isBoolean(),
    authController.edit);

authRouter.post("/grant",
    adminTestMiddleware,
    body("user").isString().isLength({min: 3, max: 20}),
    body("rights").isArray({min:1,max:3}).custom(input => {
        if (Array.isArray(input) && input.find(data => ["r","w","x"].includes(data)))
        {
            return true;
        }
        throw new Error("Bad rights.");
    }),
    authController.grant);

authRouter.post("/refresh",
    authController.refresh);

authRouter.post("/checkToken",
    authController.checkAccessToken);

authRouter.post("/logout",
    authController.logout);




export default authRouter;