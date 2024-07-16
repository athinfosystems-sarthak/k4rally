const mongoose = require('mongoose');

const { Schema } = mongoose;

const configSchema = new Schema({
  congifType: {
    type: String,
  },
  value: {
    type: Number,
  },
  chain: {
    type: String,
  },

});
const configModel = mongoose.model('configs', configSchema);
module.exports = configModel;
