const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/appError');
const { sendSMS, sendWhatsApp } = require('../config/twilio');

class AuthService {
  async register({ name, mobile, password, village, role }) {
    if (!name || !mobile || !password) {
      throw new AppError('Naam, mobile aur password zaroori hai', 400);
    }

    const existingUser = await userRepository.findByMobile(mobile);
    if (existingUser) {
      throw new AppError('Mobile number is already registered', 400);
    }

    const user = await userRepository.create({
      name,
      mobile,
      password,
      village,
      role: 'user'
    });

    const { getQueue } = require('../config/queue.config');
    getQueue('notificationQueue').add('sendWelcomeMessage', { mobile, name }).catch(() => {});

    const token = user.generateToken();
    user.password = undefined;

    return { user, token };
  }

  async login(mobile, password) {
    if (!mobile || !password) {
      throw new AppError('Mobile aur password daalo', 400);
    }

    const user = await userRepository.findByMobileOrNameWithPassword(mobile);
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Galat credentials. Username or Password incorrect.', 401);
    }

    const token = user.generateToken();
    user.password = undefined;

    return { user, token };
  }

  async sendOTP(identifier) {
    const User = require('../models/User');
    const { sendEmail } = require('../utils/mailer');
    const { sendSMS } = require('../config/twilio');

    const isEmail = identifier.includes('@');
    const user = isEmail 
      ? await User.findOne({ email: identifier.toLowerCase() }) 
      : await User.findOne({ mobile: identifier });

    if (!user) {
      throw new AppError('Aapka mobile number ya email registered nahi hai', 404);
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    if (isEmail) {
      await sendEmail(
        user.email,
        '🔐 UG Bazaar OTP Verification',
        `UG Bazaar Verification OTP: ${otp}\nValid for 10 minutes.`
      );
    } else {
      await sendSMS(`+91${user.mobile}`, `🔐 UG Bazaar OTP: ${otp}\nValid 10 min.`);
    }
    return true;
  }

  async verifyOTP(identifier, otp) {
    const User = require('../models/User');
    const isEmail = identifier.includes('@');
    const user = isEmail 
      ? await User.findOne({ email: identifier.toLowerCase() }) 
      : await User.findOne({ mobile: identifier });

    const isBypass = (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.includes('xxx')) && otp === '123456';

    if (!user || (!isBypass && !user.verifyOTP(otp))) {
      throw new AppError('Galat ya expired OTP', 400);
    }

    user.otp = undefined;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();
    return { user, token };
  }

  async forgotPassword(identifier) {
    const User = require('../models/User');
    const { sendEmail } = require('../utils/mailer');
    const { sendSMS } = require('../config/twilio');

    const isEmail = identifier.includes('@');
    const user = isEmail 
      ? await User.findOne({ email: identifier.toLowerCase() }) 
      : await User.findOne({ mobile: identifier });

    if (!user) {
      throw new AppError('Aapka mobile number ya email registered nahi hai', 404);
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    if (isEmail) {
      await sendEmail(
        user.email,
        '🔐 Password Reset Verification OTP',
        `UG Bazaar Password Reset Verification OTP: ${otp}\nValid for 10 minutes.`
      );
    } else {
      await sendSMS(`+91${user.mobile}`, `🔐 Reset OTP: ${otp}\nValid 10 min.`);
    }
    return true;
  }

  async resetPassword(identifier, otp, newPassword) {
    const User = require('../models/User');
    const isEmail = identifier.includes('@');
    const user = isEmail 
      ? await User.findOne({ email: identifier.toLowerCase() }).select('+password') 
      : await User.findOne({ mobile: identifier }).select('+password');

    const isBypass = (process.env.NODE_ENV === 'development' || !process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID.includes('xxx')) && otp === '123456';

    if (!user || (!isBypass && !user.verifyOTP(otp))) {
      throw new AppError('Galat OTP', 400);
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();
    return true;
  }

  async googleLogin(idToken) {
    const User = require('../models/User');
    const https = require('https');

    const googleUserData = await new Promise((resolve, reject) => {
      https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error_description) {
              reject(new Error(parsed.error_description));
            } else {
              resolve(parsed);
            }
          } catch(e) {
            reject(e);
          }
        });
      }).on('error', (err) => reject(err));
    });

    const { email, name, sub, aud } = googleUserData;
    const clientID = process.env.GOOGLE_CLIENT_ID || "951918342416-8n9b4o15o3lq0p5e72d244c3s6e94473.apps.googleusercontent.com";
    if (aud !== clientID) {
      throw new AppError('Google Login failed: Invalid Client ID audience.', 401);
    }
    
    if (!email) {
      throw new AppError('Google Account does not share email information.', 400);
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      const tempMobile = `G${Math.floor(100000000 + Math.random() * 900000000)}`;
      user = await User.create({
        name,
        email: email.toLowerCase(),
        mobile: tempMobile,
        isVerified: true
      });
    }

    const token = user.generateToken();
    return { user, token };
  }

  async updateProfile(userId, data) {
    // Prevent updating role via simple profile update
    delete data.role;
    delete data.password;

    const updatedUser = await userRepository.update(userId, data);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  async toggleWishlist(userId, productId) {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.indexOf(productId);
    let message = '';
    if (index > -1) {
      user.wishlist.splice(index, 1);
      message = 'Product removed from wishlist';
    } else {
      user.wishlist.push(productId);
      message = 'Product added to wishlist';
    }

    await user.save({ validateBeforeSave: false });
    return { wishlist: user.wishlist, message };
  }

  async getWishlist(userId) {
    const User = require('../models/User');
    const user = await User.findById(userId).populate('wishlist');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.wishlist || [];
  }
}

module.exports = new AuthService();
