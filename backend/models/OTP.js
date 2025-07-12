const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      len: [6, 6]
    }
  },
  type: {
    type: DataTypes.ENUM(['password_reset', 'email_verification']),
    defaultValue: 'password_reset',
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'otps',
  indexes: [
    {
      fields: ['email', 'type']
    },
    {
      fields: ['expires_at']
    }
  ]
});

// Instance methods
OTP.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

OTP.prototype.isValid = function() {
  return !this.isUsed && !this.isExpired();
};

// Class methods
OTP.createOTP = async function(email, type = 'password_reset') {
  // Delete any existing unused OTPs for this email and type
  await this.destroy({
    where: {
      email,
      type,
      isUsed: false
    }
  });

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return this.create({
    email,
    otp,
    type,
    expiresAt
  });
};

OTP.verifyOTP = async function(email, otp, type = 'password_reset') {
  const otpRecord = await this.findOne({
    where: {
      email,
      otp,
      type,
      isUsed: false
    }
  });

  if (!otpRecord) {
    return { valid: false, message: 'Invalid OTP' };
  }

  if (otpRecord.isExpired()) {
    return { valid: false, message: 'OTP has expired' };
  }

  // Mark OTP as used
  await otpRecord.update({ isUsed: true });

  return { valid: true, message: 'OTP verified successfully' };
};

module.exports = OTP; 