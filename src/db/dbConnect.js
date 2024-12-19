import mongoose from "mongoose";

export const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connected successfully on "+connectionInstance.connection.host)
    } catch (error) {
        console.log("Something is wrong while connecting to database"+error)
        process.exit(1)
    }
}

export default connectDB