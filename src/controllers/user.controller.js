import asyncHandler from '../utils/asyncHandler.js'

const userSignup = asyncHandler((req ,res)=>{
    res.status(200).json({
        success:true,
        message:"bhai server garam ho gaya"
    })
})


export {
    userSignup
}