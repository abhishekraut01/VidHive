import { Router } from "express";
const userRouter = Router()
import { userSignup } from "../controllers/user.controller.js";
import upload from "../middlewares/Multer.middleware.js";

userRouter.route("/signup").post(upload.fields[
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    }
] , userSignup)

export default userRouter
