import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { fullName, email, mobile, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      fullName,
      email,
      mobile,
      password,
      role: role || 'customer',
      verificationToken
    });

    // Create Cart and Wishlist for new user
    await Cart.create({ userId: user._id, items: [] });
    await Wishlist.create({ userId: user._id, products: [] });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <h1>Email Verification</h1>
      <p>Hello ${user.fullName},</p>
      <p>Thank you for registering at Foodie B2B Wholesale. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email Address</a>
      <p>This link is valid for 24 hours.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Verify your Foodie Wholesale Account',
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get tokens
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  try {
    if (!token) {
      res.status(401);
      throw new Error('Session expired. Refresh token missing.');
    }

    const user = await User.findOne({ refreshToken: token });
    if (!user) {
      res.status(403);
      throw new Error('Invalid refresh token.');
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        accessToken: newAccessToken
      });
    } catch (err) {
      user.refreshToken = undefined;
      await user.save();
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.status(403);
      throw new Error('Expired refresh token. Please login again.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  try {
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email address verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Request reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('No user found with that email address');
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const emailHtml = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your Foodie Wholesale account.</p>
      <p>Please click the link below to set a new password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email. The link is valid for 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Foodie Wholesale Password Reset Request',
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email address.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    user.password = password; // pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GOOGLE OAUTH 2.0 CONTROLLER
// ==========================================

import { OAuth2Client } from 'google-auth-library';

const getOAuthClient = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
  );
};

const processGoogleUser = async ({ email, name, googleId, picture }) => {
  if (!email) {
    throw new Error('Google account must have a verified email address.');
  }

  let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

  if (user) {
    let updated = false;
    if (!user.googleId) {
      user.googleId = googleId;
      updated = true;
    }
    if (picture && (!user.avatar || !user.profileImage)) {
      user.avatar = picture;
      user.profileImage = picture;
      updated = true;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  } else {
    user = await User.create({
      fullName: name || 'Google User',
      email: email.toLowerCase(),
      googleId,
      avatar: picture || '',
      profileImage: picture || '',
      isVerified: true,
      role: 'customer'
    });

    await Cart.create({ userId: user._id, items: [] });
    await Wishlist.create({ userId: user._id, products: [] });
  }

  return user;
};

// @desc    Authenticate with Google OAuth 2.0 (ID token / credential / code)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const { credential, token, code } = req.body;
    let googleId, email, name, picture;

    const oauthClient = getOAuthClient();

    if (credential || token) {
      const idToken = credential || token;
      const ticket = await oauthClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (code) {
      const { tokens } = await oauthClient.getToken(code);
      oauthClient.setCredentials(tokens);
      const ticket = await oauthClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      res.status(400);
      throw new Error('Google credential or token is required.');
    }

    const user = await processGoogleUser({ email, name, googleId, picture });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        profileImage: user.profileImage || user.avatar,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401);
    next(new Error(`Google authentication failed: ${error.message}`));
  }
};

// @desc    Redirect to Google OAuth 2.0 authorization page
// @route   GET /api/auth/google
// @access  Public
export const getGoogleAuthUrl = async (req, res, next) => {
  try {
    const oauthClient = getOAuthClient();
    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      prompt: 'select_account'
    });
    res.redirect(url);
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth 2.0 Callback handler
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;

    const clientUrl =
      process.env.CLIENT_URL || 'http://localhost:5173';

    if (error || !code) {
      return res.redirect(
        `${clientUrl}/foodie/login?error=${encodeURIComponent(
          error || 'Google authentication was cancelled'
        )}`
      );
    }

    const oauthClient = getOAuthClient();

    const { tokens } = await oauthClient.getToken(code);

    oauthClient.setCredentials(tokens);

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    const user = await processGoogleUser({
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
      picture: payload.picture
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to Foodie frontend
    res.redirect(
      `${clientUrl}/foodie/login?token=${accessToken}`
    );

  } catch (error) {
    console.error('Google Callback Error:', error.message);

    const clientUrl =
      process.env.CLIENT_URL || 'http://localhost:5173';

    res.redirect(
      `${clientUrl}/foodie/login?error=${encodeURIComponent(
        'Google authentication failed. Please try again.'
      )}`
    );
  }
};
