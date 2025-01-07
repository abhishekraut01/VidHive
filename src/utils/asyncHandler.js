
const asyncHandler =(fn)=>{
    return async (req,res,next)=>{
        try {
            await fn(req,res,next)
        } catch (error) {
            console.log(error)
            const statusCode = error.statusCode || 500
            const message = error.message

            return res.status(statusCode).json({
                success : false,
                message: message,
            })
        }
    }
}

export default asyncHandler