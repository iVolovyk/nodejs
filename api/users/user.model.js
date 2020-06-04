const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: String,
  password: String,
  subscription: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  token: String,
});

userSchema.statics.updateUser = updateUser;
userSchema.statics.findUserByEmail = findUserByEmail;

async function updateUser(userId, updateParams) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: updateParams,
    },
    {
      new: true,
    },
  );
}

async function findUserByEmail(email) {
  return this.findOne({ email });
}

//  users
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
