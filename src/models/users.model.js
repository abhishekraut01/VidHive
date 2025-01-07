import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // Optimizes queries based on username
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // Ensures uniform email format and removes extra spaces
        },
        fullName: {
            type: String,
            required: true,
            trim: true, // Removes leading/trailing whitespace
            index: true, // Improves search operations on fullname
        },
        avatar: {
            type: String, // URL for the user's avatar image (uploaded via Cloudinary)
            required: true,
        },
        coverImage: {
            type: String, // Optional URL for the user's cover image
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId, // References the "Video" model
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: true, // Stores hashed password securely
        },
        refreshToken: {
            type: String, // Token used for managing authentication/refresh token flow
            required: true,
        },
    },
    {
        timestamps: true, // Automatically manages `createdAt` and `updatedAt` fields
    }
);

// Add pagination support for aggregation queries
userSchema.plugin(mongooseAggregatePaginate);

/**
 * Middleware: Hash password before saving a user document.
 * This ensures passwords are always hashed before being stored in the database.
 */
userSchema.pre("save", async function (next) {
    // Skip if the password field hasn't been modified
    if (!this.isModified("password")) return next();

    // Hash the password with a salt factor of 10
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

/**
 * Method: Validates if the provided password matches the hashed password stored in the database.
 * @param {String} password - The plaintext password to verify.
 * @returns {Boolean} - Returns true if the password matches, false otherwise.
 */
userSchema.methods.isPasswordValid = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAccessToken(async function () {
    return await jwt.sign({
        _id : this._id,
        username : this.username,
        fullname: this.fullname,
        email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY
    })
})

// Create and export the User model
const User = mongoose.model("User", userSchema);
export default User;
