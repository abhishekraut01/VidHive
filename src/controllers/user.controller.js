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

    console.log(validationResponse.data);
    const { username, email, password, fullName } = validationResponse.data;

    // Step 2: Check if the user already exists
    const ExistingUser = await User.findOne({
        $or : [{email},{username}]
    })

    if(ExistingUser){
        throw new AppError("User Already Exist" , 409) 
    }

    // Step 3: Handle avatar file upload to Cloudinary
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new AppError("Avatar file is requied" , 409)
    }

    // Step 4: Upload images on cloudenary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    //here avatar is an object
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new AppError("Avatar file is required" , 400)
    }

    // Step 5: Create and save the user
    const newUser = await User.create({
        username : username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    // Step 6: Remove sensitive fields
    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new AppError("Error while creating user" , 500)
    }
    // Step 7: Return response
    res.status(201).json(
        new ApiResponse(200 , "User created successfully" , createdUser)
    )
   
});


export {
    userSignup
}