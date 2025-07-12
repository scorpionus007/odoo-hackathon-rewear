const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const EmailService = require('./emailService');
const { POINTS, JWT, VALIDATION, ROLE_IDS } = require('../constants');

class AuthService {
  static generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: JWT.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: JWT.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  static async register(userData) {
    const { firstName, lastName, email, phone, password, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmailOrPhone(email);
    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Map role to roleId
    const roleId = ROLE_IDS[role.toUpperCase()] || ROLE_IDS.USER;

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      roleId
    });

    // Add welcome points
    await user.addPoints(POINTS.ITEM_UPLOAD);

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Return user data without password
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
      points: user.points,
      ecoImpact: user.ecoImpact,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      ...tokens
    };
  }

  static async login(identifier, password) {
    // Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Return user data without password
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
      points: user.points,
      ecoImpact: user.ecoImpact,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      bio: user.bio,
      location: user.location,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };

    return {
      user: userResponse,
      ...tokens
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      const tokens = this.generateTokens(user.id);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      throw new Error(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, an OTP has been sent' };
    }

    try {
      // Create OTP
      const otpRecord = await OTP.createOTP(email, 'password_reset');
      
      // Send OTP email
      const emailService = new EmailService();
      await emailService.sendOTPEmail(email, otpRecord.otp);

      return { message: 'If the email exists, an OTP has been sent' };
    } catch (error) {
      console.error('Error in forgot password:', error);
      return { message: 'If the email exists, an OTP has been sent' };
    }
  }

  static async resetPassword(email, otp, newPassword, confirmPassword) {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate new password
      if (newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        throw new Error(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
      }

      // Verify OTP
      const otpVerification = await OTP.verifyOTP(email, otp, 'password_reset');
      if (!otpVerification.valid) {
        throw new Error(otpVerification.message);
      }

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async logout(userId) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return success
    return { message: 'Logged out successfully' };
  }
}

module.exports = AuthService; 