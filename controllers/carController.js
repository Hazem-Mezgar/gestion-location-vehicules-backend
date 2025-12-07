const asyncHandler = require('express-async-handler');
const Car = require('../models/car');


// @desc    Create a new car
// @route   POST /api/cars
//access   Public
const createCar= asyncHandler(async(req,res)=>{
    const{plate,brand,description}= req.body;
    if(!plate|| !brand || !description){
        res.status(400);
        throw new Error("please fill the fields");
    }
    const carExists= await Car.findOne({plate});
    if(carExists){
        res.status(400);
        throw new Error("Car already exists");
    }
    const car= await Car.create({plate , brand , description});
    if(car){
        res.status(201).json({
            _id: car._id,
            plate: car.plate,
            brand: car.brand,
            description: car.description,
        });
    }else{
        res.status(400);
        throw new Error("Invalid car data");
    }
});


// @desc    Get all cars
// @route   GET /api/cars
//access   Public
const getCars= asyncHandler(async(req,res)=>{
    const cars= await Car.find({});
    res.status(200).json(cars);
});


// @desc    Get car by ID
// @route   GET /api/cars/:id
//access   Public
const getCarById= asyncHandler(async(req,res)=>{
    const car= await Car.findById(req.params.id);
    if(car){
        res.status(200).json(car);
    }else{
        res.status(404);
        throw new Error("Car not found");
    }
});


// @desc    Delete a car
// @route   DELETE /api/cars/:id
//access   Public
const deleteCar= asyncHandler(async(req,res)=>{
    const car = await Car.findById(req.params.id);
    if(car){
        await Car.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Car removed"});
    } else {
        res.status(404);
        throw new Error("Car not found");
    }
});


// @desc    Update a car
// @route   PUT /api/cars/:id
//access   Public
const updateCar = asyncHandler(async(req, res) => {
    const {plate, brand, description} = req.body;
    
    const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        {plate, brand, description},
        {new: true, runValidators: true}
    );
    
    if(updatedCar){
        res.status(200).json(updatedCar);
    } else {
        res.status(404);
        throw new Error("Car not found");
    }
});


// @desc    Search cars by plate
// @route   GET /api/cars/search?plate=...
//access   Public
const searchCarsByPlate= asyncHandler(async(req,res)=>{
    const plateQuery= req.params.plate;
    if(!plateQuery){
        res.status(400);
        throw new Error("Please provide a plate query parameter");
    }else{
        const cars= await Car.find({plate:{$regex:plateQuery}});
        res.status(200).json(cars);
    }
});

// Exportation des fonctions du contrôleur pour les utiliser dans les routes
module.exports={createCar,getCars,getCarById,deleteCar,updateCar,searchCarsByPlate};