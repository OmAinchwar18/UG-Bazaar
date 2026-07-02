const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter = null;

// Initialize Transporter
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: (process.env.SMTP_PORT || 587) == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  logger.info('📧 Mailer initialized with SMTP configuration.');
} else {
  logger.info('📧 Mailer operating in DEV Mock Mode (Logging to Console).');
}

/**
 * Sends an email
 * @param {String} to Recipient Email Address
 * @param {String} subject Subject of Email
 * @param {String} text Text body of Email
 * @param {String} html Optional HTML body of Email
 */
const sendEmail = async (to, subject, text, html = '') => {
  try {
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"${process.env.SHOP_NAME || 'UG Bazaar'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: html || text
      });
      logger.info(`Email successfully sent to ${to}: Message ID ${info.messageId}`);
      return true;
    } else {
      logger.info(`[MOCK EMAIL DISPATCH] To: ${to} | Subject: ${subject}\nBody: ${text}`);
      return true;
    }
  } catch (err) {
    logger.error(`Error sending email to ${to}: ${err.message}`);
    return false;
  }
};

module.exports = {
  sendEmail
};
