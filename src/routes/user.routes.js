import { Router } from 'express';
import {
  changePassword,
  refreshAccessToken,
  userLogin,
  userLogout,
  userSignup,
} from '../controllers/user.controller.js';
import upload from '../middlewares/Multer.middleware.js'; // Make sure this is correctly imported
import verityJWT from '../middlewares/Auth.middleware.js';

const userRouter = Router();

// Define the POST route for signup with multiple file fields
userRouter.route('/signup').post(
  upload.fields([
    {
      name: 'avatar', // field name in the form
      maxCount: 1, // limit to one file
    },
    {
      name: 'coverImage', // another field name for the cover image
      maxCount: 1, // limit to one file
    },
  ]),
  userSignup // your controller function to handle the signup process
);

userRouter.route('/login').post(userLogin);

//secured routes
userRouter.route('/logout').post(verityJWT, userLogout);

userRouter.route('/refresh-access-token').post(refreshAccessToken);

userRouter.route('/changePassword').post(verityJWT, changePassword);

userRouter.route('/getCurrentUser').post(verityJWT, getCurrentUser);

export default userRouter;
