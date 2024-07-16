const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema(
  {

    walletAddress: {
      type: String,
    },
  },
  {
    timestamp: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },

);
userSchema.virtual('vestingDetails', {
  ref: 'vestings',
  localField: '_id',
  foreignField: 'user_id',
});

exports.userSchema = userSchema;

const userModel = mongoose.model('users', userSchema);
module.exports = userModel;
