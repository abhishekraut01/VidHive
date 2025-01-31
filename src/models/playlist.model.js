import mongoose from 'mongoose';

const playlistSchema = mongoose.Schema(
  {
    name:{
        type:String,
        require:true,
    },
    description:{
        type:String,
        require:true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  },
  {
    timestamps: true,
  }
);

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;