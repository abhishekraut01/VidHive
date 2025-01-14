import User from '../models/users.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

const verityJWT = asyncHandler(async (req, _, next) => {
  try {
    //Get token from cookies or authorization header
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Unauthorized Request', 401);
    }

    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decode?._id).select(
      '-password -refreshToken'
    );

    if (!user) {
      throw new AppError('Invalid access token', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError('Invalid access token', 401);
  }
});

export default verityJWT;
