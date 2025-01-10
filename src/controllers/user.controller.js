import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signUpvalidationSchema } from '../utils/validationSchema.js';
import { loginValidationSchema } from '../utils/validationSchema.js';
import User from '../models/users.model.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new AppError('Error while generating access and refresh token', 500);
  }
};

const userSignup = asyncHandler(async (req, res) => {
  // Step 1: Schema validation
  const validationResponse = signUpvalidationSchema.safeParse(req.body);
  if (!validationResponse.success) {
    throw new AppError(
      'Validation failed',
      400,
      validationResponse.error.errors
    );
  }

  const { username, email, password, fullName } = validationResponse.data;

  // Step 2: Check if the user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  // Step 3: Handle avatar and cover image file uploads
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new AppError('Avatar file is required', 400);
  }

  // Step 4: Upload images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new AppError('Error uploading avatar file', 400);
  }

  // Step 5: Create and save the user
  const newUser = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });

  // Step 6: Remove sensitive fields for the response
  const createdUser = await User.findById(newUser._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new AppError('Error while creating user', 500);
  }

  // Step 7: Return response
  res
    .status(201)
    .json(new ApiResponse(201, 'User created successfully', createdUser));
});

const userLogin = asyncHandler(async (req, res) => {
  // Step 1: Validate user input
  const validationResult = loginValidationSchema.safeParse(req.body);

  if (!validationResult.success) {
    throw new AppError(
      'User input is invalid',
      409,
      validationResult.error.errors
    );
  }

  const { username, email, password } = validationResult.data;

  if (!username && !email) {
    throw new AppError('Username or email is required', 409);
  }

  if (!password) {
    throw new AppError('Password is required', 409);
  }

  // Step 2: Check if user exists in the database
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!userExist) {
    throw new AppError('User does not exist. Please signup first', 409);
  }

  // Step 3: Check if the password is correct
  const isPasswordCorrect = await userExist.isPasswordValid(password);

  if (!isPasswordCorrect) {
    throw new AppError('Password is incorrect', 401);
  }

  // Step 4: Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userExist._id
  );

  const userResponse = await User.findById(userExist._id).select(
    '-password -refreshToken'
  );

  const options = {
    secure: true,
    httpOnly: true,
    sameSite: 'Strict',
  };

  // Step 6: Return response
  res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, 'Login successful', {
        accessToken,
        refreshToken,
        user: userResponse.toObject({
          getters: true,
          virtuals: false,
          versionKey: false,
        }),
      })
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    secure: true,
    httpOnly: true,
    sameSite: 'Strict',
  };

  res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, 'User LoggedOut', {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Taking the refresh token from the user
  const incomingRefreshToken =
    req.body.refreshToken || req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new AppError('Unauthorized request', 403);
  }

  try {
    // Validate the token
    let decode;
    try {
      decode = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      throw new AppError('Token is invalid', 403);
    }

    const user = await User.findById(decode._id);
    if (!user) {
      throw new AppError('Refresh token is invalid', 403);
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new AppError('Token is invalid or expired', 403);
    }

    const options = {
      secure: true,
      httpOnly: true,
      sameSite: 'Strict',
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(
        new ApiResponse(200, 'Access token refreshed', {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    throw new AppError('Token is invalid or expired', 403 , error.errors);
  }
});

export { userSignup, userLogin, userLogout, refreshAccessToken };
