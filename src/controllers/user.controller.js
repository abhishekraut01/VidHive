import AppError from '../utils/AppError.js'
import asyncHandler from '../utils/asyncHandler.js'
import signUpvalidationSchema from '../utils/validationSchema.js'
import User from '../models/users.model.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';



const userSignup = asyncHandler(async (req, res) => {
    // Step 1: Schema validation
    const validationResponse = signUpvalidationSchema.safeParse(req.body);
    if (!validationResponse.success) {
        throw new AppError("Validation failed", 400, validationResponse.error.errors);
    }

    const { username, email, password, fullName } = validationResponse.data;

    // Step 2: Check if the user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    // Step 3: Handle avatar and cover image file uploads
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new AppError("Avatar file is required", 400);
    }

    // Step 4: Upload images to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new AppError("Error uploading avatar file", 400);
    }

    // Step 5: Create and save the user
    const newUser = await User.create({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // Step 6: Remove sensitive fields for the response
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new AppError("Error while creating user", 500);
    }

    // Step 7: Return response
    res.status(201).json(
        new ApiResponse(201, "User created successfully", createdUser)
    );
});



export { userSignup };