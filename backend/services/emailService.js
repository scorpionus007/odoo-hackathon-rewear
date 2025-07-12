const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send email with template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    // Read template file
    const templatePath = path.join(__dirname, '../templates/emails', `${template}.html`);
    let htmlContent = await fs.readFile(templatePath, 'utf8');

    // Replace template variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, data[key]);
    });

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Send result
 */
const sendPasswordResetEmail = async (to, firstName, otp) => {
  return sendEmail({
    to,
    subject: 'Password Reset OTP - ReWear',
    template: 'passwordReset',
    data: {
      firstName,
      otp,
      expiryMinutes: 10,
      appName: 'ReWear',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Send welcome email
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @returns {Promise<Object>} Send result
 */
const sendWelcomeEmail = async (to, firstName) => {
  return sendEmail({
    to,
    subject: 'Welcome to ReWear!',
    template: 'welcome',
    data: {
      firstName,
      appName: 'ReWear',
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Send swap offer notification email
 * @param {string} to - Recipient email
 * @param {string} firstName - Recipient's first name
 * @param {string} fromName - Sender's name
 * @param {string} itemTitle - Item title
 * @returns {Promise<Object>} Send result
 */
const sendSwapOfferEmail = async (to, firstName, fromName, itemTitle) => {
  return sendEmail({
    to,
    subject: `New Swap Offer for ${itemTitle} - ReWear`,
    template: 'swapOffer',
    data: {
      firstName,
      fromName,
      itemTitle,
      appName: 'ReWear',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Send swap accepted email
 * @param {string} to - Recipient email
 * @param {string} firstName - Recipient's first name
 * @param {string} itemTitle - Item title
 * @returns {Promise<Object>} Send result
 */
const sendSwapAcceptedEmail = async (to, firstName, itemTitle) => {
  return sendEmail({
    to,
    subject: `Swap Accepted for ${itemTitle} - ReWear`,
    template: 'swapAccepted',
    data: {
      firstName,
      itemTitle,
      appName: 'ReWear',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Send badge awarded email
 * @param {string} to - Recipient email
 * @param {string} firstName - Recipient's first name
 * @param {string} badgeType - Badge type
 * @returns {Promise<Object>} Send result
 */
const sendBadgeAwardedEmail = async (to, firstName, badgeType) => {
  return sendEmail({
    to,
    subject: `Congratulations! You've earned the ${badgeType} badge - ReWear`,
    template: 'badgeAwarded',
    data: {
      firstName,
      badgeType,
      appName: 'ReWear',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Send reward redeemed email
 * @param {string} to - Recipient email
 * @param {string} firstName - Recipient's first name
 * @param {string} rewardTitle - Reward title
 * @param {number} pointsSpent - Points spent
 * @returns {Promise<Object>} Send result
 */
const sendRewardRedeemedEmail = async (to, firstName, rewardTitle, pointsSpent) => {
  return sendEmail({
    to,
    subject: `Reward Redeemed: ${rewardTitle} - ReWear`,
    template: 'rewardRedeemed',
    data: {
      firstName,
      rewardTitle,
      pointsSpent,
      appName: 'ReWear',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Send general notification email
 * @param {string} to - Recipient email
 * @param {string} firstName - Recipient's first name
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<Object>} Send result
 */
const sendNotificationEmail = async (to, firstName, title, message) => {
  return sendEmail({
    to,
    subject: `${title} - ReWear`,
    template: 'notification',
    data: {
      firstName,
      title,
      message,
      appName: 'ReWear',
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rewear.com'
    }
  });
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} Configuration status
 */
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSwapOfferEmail,
  sendSwapAcceptedEmail,
  sendBadgeAwardedEmail,
  sendRewardRedeemedEmail,
  sendNotificationEmail,
  verifyEmailConfig
}; 