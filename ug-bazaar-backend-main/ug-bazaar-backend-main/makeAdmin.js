require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const mobile = process.argv[2];
if (!mobile) {
  console.log('Usage: node makeAdmin.js <mobile_number>');
  process.exit(1);
}

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ugbazaar';
    await mongoose.connect(mongoUri);
    const user = await User.findOne({ mobile });
    if (!user) {
      console.log(`Error: User with mobile number ${mobile} not found. Please register this account on the website first.`);
      mongoose.connection.close();
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`Success: User ${user.name} (${mobile}) has been successfully updated to 'admin' role!`);
    mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
    mongoose.connection.close();
    process.exit(1);
  }
};

run();
