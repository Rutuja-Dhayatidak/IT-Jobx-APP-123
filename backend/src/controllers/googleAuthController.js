const axios = require('axios');
const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
require('dotenv').config();

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'ID token required' });

    // Verify token with Google
    const tokenInfoRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    const payload = tokenInfoRes.data;

    const email = payload.email;
    const googleId = payload.sub;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';
    const avatar = payload.picture || '';

    // Find existing user by googleId or email
    let user = await Candidate.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      // Create new candidate
      user = await Candidate.create({
        email,
        firstName,
        lastName,
        googleId,
        avatar,
        role: 'candidate',
        // Generate a random password placeholder (since password not used for Google login)
        password: Math.random().toString(36).slice(-8),
      });
    } else if (!user.googleId) {
      // Link existing account with Google ID
      user.googleId = googleId;
      user.avatar = avatar;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'ITjobx_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Google authentication successful',
      token,
      role: user.role,
      user: { _id: user._id, firstName: user.firstName, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ message: err.response?.data?.error_description || err.message || 'Google authentication failed' });
  }
};
