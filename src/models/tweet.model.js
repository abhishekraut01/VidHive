import mongoose from 'mongoose';

const twitterSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps:true
  }
);

const Tweet = mongoose.model('Tweet',twitterSchema)
export default Tweet