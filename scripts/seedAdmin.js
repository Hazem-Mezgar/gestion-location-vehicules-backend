require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_DB_URL);
    await connectDB();
    
    const email = 'admin@car.com';
    const password = 'admin123';
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists');
      process.exit(0);
    }
    
    const hashed = await bcrypt.hash(password, 10);
    
    await User.create({
      role: 'admin',
      email,
      password: hashed,
    });
    
    console.log('Admin created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
