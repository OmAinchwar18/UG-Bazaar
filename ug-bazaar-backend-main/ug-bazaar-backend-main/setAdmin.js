const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    await mongoose.connect(mongoUri);
    let user = await User.findOne({ mobile: '9999999999' });
    if (!user) {
      user = new User({
        name: 'Test Admin',
        mobile: '9999999999',
        isVerified: true
      });
    }
    user.role = 'admin';
    user.password = 'password123'; // will be hashed in pre-save hook
    await user.save();
    console.log('SUCCESS: Admin set successfully.');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};
run();
