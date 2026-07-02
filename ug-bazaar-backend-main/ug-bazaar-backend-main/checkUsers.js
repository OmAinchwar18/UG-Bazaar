const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    await mongoose.connect(mongoUri);
    const users = await User.find({}, 'name mobile role');
    console.log('USERS IN DB:', JSON.stringify(users, null, 2));
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
};
run();
