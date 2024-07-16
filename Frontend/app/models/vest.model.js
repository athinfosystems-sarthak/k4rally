const mongoose = require('mongoose');

const { Schema } = mongoose;
const { STATUS } = require('../utils/enumHelper');

const Status = Object.values(STATUS);
const vestSchema = new Schema({
  scheduleId: {
    type: String,
  },
  user_id: {
    type: Schema.Types.ObjectId,
  },
  beneficieryAddress: {
    type: String,
  },
  amount: {
    type: String,
  },
  burnDate: {
    type: Date,

  },
  withdrawTime: {
    type: Date,
  },
  claim: {
    type: String,
    enum: Status,
    default: STATUS.INCOMPLETE,
  },

}, {
  timestamps: true,
});
const vestModel = mongoose.model('vestings', vestSchema);
module.exports = vestModel;
