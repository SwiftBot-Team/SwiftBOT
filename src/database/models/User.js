const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userID: String,
  mails: [
    {
      id: String,
      content: {
        title: String,
        timestamp: String,
        body: String
      }
    }
  ],

  jail: Boolean,
  coins: Number,
  hasBank: Boolean,
  bank: Number
});

module.exports = mongoose.model('User', userSchema);
