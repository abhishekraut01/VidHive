import { Router } from "express";
import { userSignup } from "../controllers/user.controller.js";
import upload from "../middlewares/Multer.middleware.js"; // Make sure this is correctly imported

const userRouter = Router();

// Define the POST route for signup with multiple file fields
userRouter.route("/signup").post(
    upload.fields([
        {
            name: "avatar", // field name in the form
            maxCount: 1,     // limit to one file
        },
        {
            name: "coverImage", // another field name for the cover image
            maxCount: 1,        // limit to one file
        }
    ]),
    userSignup // your controller function to handle the signup process
);

export default userRouter;
