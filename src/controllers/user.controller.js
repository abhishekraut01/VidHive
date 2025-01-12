import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  passwordValidationSchema,
  signUpvalidationSchema,
  loginValidationSchema,
  updateDetailsValidationSchema,
} from '../utils/validationSchema.js';
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
  console.log(req.files);
  console.log(req.files?.avatar);
  console.log(req.files?.avatar?.[0]);
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
    throw new AppError('Token is invalid or expired', 403, error.errors);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const validationResponse = passwordValidationSchema.safeParse(req.body);

  if (!validationResponse.success) {
    throw new AppError(
      'Password format is invalid',
      409,
      validationResponse.error.errors
    );
  }

  const { oldPassword, newPassword } = validationResponse.data;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Compare the old password with the one in the database
  const isPasswordCorrect = await user.isPasswordValid(oldPassword);

  if (!isPasswordCorrect) {
    throw new AppError('Old password is invalid', 400);
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, 'Password changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  res
    .status(200)
    .json(new ApiResponse(200, 'user data fetched successfully', user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const validationResponse = updateDetailsValidationSchema.safeParse(req.body);

  if (!validationResponse.success) {
    throw new AppError(
      'Input format is invalid',
      409,
      validationResponse.error.errors
    );
  }

  // Extract user information
  const { username, fullName, email } = validationResponse.data;

  if (!(username || fullName || email)) {
    throw new AppError('At least one field is required for update', 400);
  }

  // Database call for updating the user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username,
        email,
        fullName,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json(
    new ApiResponse(200, 'User information updated successfully', {
      user: updatedUser.toObject({
        getters: true,
        virtuals: false,
        versionKey: false,
      }),
    })
  );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new AppError('Avatar is required', 400);
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new AppError('Failed to update avatar', 500);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new AppError('User does not exist', 404);
  }

  res.status(200).json(
    new ApiResponse(200, 'Avatar updated successfully', {
      user: user.toObject({
        getters: true,
        virtuals: false,
        versionKey: false,
      }),
    })
  );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new AppError('coverImage is required', 400);
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new AppError('Failed to update coverImage', 500);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new AppError('User does not exist', 404);
  }

  res.status(200).json(
    new ApiResponse(200, 'coverImage updated successfully', {
      user: user.toObject({
        getters: true,
        virtuals: false,
        versionKey: false,
      }),
    })
  );
});

export {
  userSignup,
  userLogin,
  userLogout,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage
};
