import { Router } from "express";
const userRouter = Router()
import { userSignup } from "../controllers/user.controller.js";

userRouter.route("/signup").post(userSignup)

export default userRouter
