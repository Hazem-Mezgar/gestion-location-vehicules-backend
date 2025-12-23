// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
