import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
       
        title: {
            type: String,        //will came from cloudnery
            required: true,
        },
        description: {
            type: String,
            required: true,       //will came from cloudnery
        },
        duration: {
            type:Number,
            required:true
        },
        views: {
            type: Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:false
        },
        Owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)



const Video = mongoose.model('Video', videoSchema)

export default Video