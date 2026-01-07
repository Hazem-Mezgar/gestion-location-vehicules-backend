const asyncHandler = require("express-async-handler");
const Car = require("../models/car");
const Category = require("../models/Category");

// @desc    Create a new car
// @route   POST /api/cars
//access   Public
const createCar = asyncHandler(async (req, res) => {
  const {
    plate,
    brand,
    description,
    pricePerday,
    imageUrl,
    available,
    categories,
  } = req.body;

  if (!plate || !brand || !description || !pricePerday || !imageUrl) {
    res.status(400);
    throw new Error(
      "Please fill all required fields (plate, brand, description, pricePerday, imageUrl)"
    );
  }

  const carExists = await Car.findOne({ plate });

  if (carExists) {
    res.status(400);
    throw new Error("Car already exists");
  }

  const car = await Car.create({
    plate,
    brand,
    description,
    pricePerday,
    imageUrl,
    available: available !== undefined ? available : true,
    categories,
  });

  if (car) {
    res.status(201).json({
      _id: car._id,
      plate: car.plate,
      brand: car.brand,
      description: car.description,
      pricePerday: car.pricePerday,
      imageUrl: car.imageUrl,
      available: car.available,
      categories: car.categories,
    });
  } else {
    res.status(400);
    throw new Error("Invalid car data");
  }
});

// @desc    Get all cars
// @route   GET /api/cars
//access   Public
const getCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({}).populate("categories", "name");
  res.status(200).json(cars);
});

// @desc    Get car by ID
// @route   GET /api/cars/:id
//access   Public
const getCarById = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id).populate("categories");
  if (car) {
    res.status(200).json(car);
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});

// @desc    Delete a car
// @route   DELETE /api/cars/:id
//access   Public
const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (car) {
    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Car removed" });
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});

// @desc    Update a car
// @route   PUT /api/cars/:id
//access   Public
const updateCar = asyncHandler(async (req, res) => {
  const updatedCar = await Car.findByIdAndUpdate(
    req.params.id,
    req.body, 
    { new: true, runValidators: true }
  ).populate("categories");

  if (updatedCar) {
    res.status(200).json(updatedCar);
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});

// @desc    Search cars by plate
// @route   GET /api/cars/search?plate=...
//access   Public
const searchCarsByPlate = asyncHandler(async (req, res) => {
  const plateQuery = req.query.plate; // Change from req.params to req.query
  if (!plateQuery) {
    res.status(400);
    throw new Error("Please provide a plate query parameter");
  }
  
  const cars = await Car.find({ plate: { $regex: plateQuery, $options: 'i' } });
  res.status(200).json(cars);
});

// @desc   Attach categories to a car
// @route  PUT /api/cars/:id/categories
// @access Admin (protect in routes)
const attachCategoriesToCar = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const { categoryIds = [] } = req.body;
  // check car exists
  const car = await Car.findById(id);
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }

  //verify categories exist
  const existingCategories = await Category.find({
    _id: { $in: categoryIds },
  });
  if (existingCategories.length !== categoryIds.length) {
    res.status(400);
    throw new Error("One or more categories do not exist");
  }


  // update car categories
  car.categories = categoryIds;
  await car.save();


  //maintain reverse relation on Category.cars
  await Category.updateMany(
    { _id: { $in: categoryIds } },
    { $addToSet: { cars: car._id } }
  );


  const populatedCar = await car.populate("categories");
  res.status(200).json(populatedCar);

});

// Exportation des fonctions du contrôleur pour les utiliser dans les routes
module.exports = {
  createCar,
  getCars,
  getCarById,
  deleteCar,
  updateCar,
  searchCarsByPlate,
  attachCategoriesToCar,
};
