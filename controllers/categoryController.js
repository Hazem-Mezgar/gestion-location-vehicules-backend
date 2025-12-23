const Category = require("../models/Category");
const Car = require("../models/car");
const asyncHandler = require('express-async-handler');


const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(); // add .populate('cars') if needed
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    //remove this category from all cars when deleted
    await Car.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const attachCarsToCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { carIds = [] } = req.body;

  if (!Array.isArray(carIds)) {
    res.status(400);
    throw new Error('carIds must be an array of IDs');
  }

  const category = await Category.findById(id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Verify cars exist
  const cars = await Car.find({ _id: { $in: carIds } });
  if (cars.length !== carIds.length) {
    res.status(400);
    throw new Error('One or more cars do not exist');
  }

  // Update category.cars
  category.cars = carIds;
  await category.save();

  // Update cars to include this category (keep sync)
  await Car.updateMany(
    { _id: { $in: carIds } },
    { $addToSet: { categories: category._id } }
  );

  const populatedCategory = await Category.findById(id).populate('cars');
  res.status(200).json(populatedCategory);
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  attachCarsToCategory,
};
