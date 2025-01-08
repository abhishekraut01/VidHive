import AppError from '../utils/AppError.js'
import asyncHandler from '../utils/asyncHandler.js'
import signUpvalidationSchema from '../utils/validationSchema.js'
import User from '../models/users.model.js';

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
        $or : username , email
    })
    if(ExistingUser){
        throw new AppError("User Already Exist") 
    }
    // Step 3: Handle avatar file upload to Cloudinary
    

    // Step 4: Create and save the user
    

    // Step 5: Remove sensitive fields
   

    // Step 6: Return response
   
});


export {
    userSignup
}