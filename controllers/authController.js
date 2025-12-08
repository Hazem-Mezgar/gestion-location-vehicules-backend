// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d';

exports.register = async (req, res) => {
  try {
    const {
      role = 'client',
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      identityCardNumber,
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Client validation
    if (role === 'client') {
      if (!firstName || !lastName || !phoneNumber || !identityCardNumber) {
        return res.status(400).json({
          message: 'firstName, lastName, phoneNumber, and identityCardNumber are required for clients',
        });
      }
    }

    // Check if email exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      role,
      email,
      password: hashed,
      ...(role === 'client' && {
        firstName,
        lastName,
        phoneNumber,
        identityCardNumber,
      }),
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        ...(user.firstName && { firstName: user.firstName }),
        ...(user.lastName && { lastName: user.lastName }),
        ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
        ...(user.identityCardNumber && { identityCardNumber: user.identityCardNumber }),
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password 
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Response (dynamic fields based on user data)
    res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        ...(user.firstName && { firstName: user.firstName }),
        ...(user.lastName && { lastName: user.lastName }),
        ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
        ...(user.identityCardNumber && { identityCardNumber: user.identityCardNumber }),
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
