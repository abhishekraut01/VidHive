import mongoose from 'mongoose';

const likeModel = mongoose.Schema(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    tweet:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
    }
  },
  {
    timestamps: true,
  }
);

const Like = mongoose.model('Like', likeModel);
export default Like;
