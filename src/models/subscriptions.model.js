import mongoose from 'mongoose';

const subscriptionsSchema = mongoose.model({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
},{createdAt:true});

const Subscription = mongoose.model("Subscription" , subscriptionsSchema)

export default Subscription