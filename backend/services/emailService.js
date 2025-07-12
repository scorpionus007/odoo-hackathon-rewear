const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generate OTP
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP email
  async sendOTPEmail(email, otp) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'ReWear - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
            <h1>ReWear</h1>
            <p>Community Clothing Exchange Platform</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Use the following OTP to complete the process:</p>
            <div style="background-color: #16a34a; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            <p>Best regards,<br>Team ReWear</p>
          </div>
          <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw new Error('Failed to send email');
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, firstName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to ReWear!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to ReWear!</h1>
            <p>Community Clothing Exchange Platform</p>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Hello ${firstName}!</h2>
            <p>Welcome to ReWear! You've successfully joined our community of sustainable fashion enthusiasts.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>Upload your clothes for swapping</li>
              <li>Browse items from other community members</li>
              <li>Make swap requests</li>
              <li>Track your eco-impact</li>
              <li>Earn points for sustainable actions</li>
            </ul>
            <p>Start your sustainable fashion journey today!</p>
            <p>Best regards,<br>Team ReWear</p>
          </div>
          <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent: ', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending welcome email: ', error);
      // Don't throw error for welcome email
      return false;
    }
  }
}

module.exports = EmailService; 