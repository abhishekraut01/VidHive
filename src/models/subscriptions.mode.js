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

const Subscriptions = mongoose.model("Subscriptions" , subscriptionsSchema)

export default Subscriptions