const express =require('express');
const router= express.Router();
const { createCar , getCars , deleteCar, getCarById , updateCar , searchCarsByPlate } = require('../controllers/carController');

router.post('/', createCar);
router.get('/',getCars);
router.get('/search/:plate',searchCarsByPlate);
router.get('/:id',getCarById);
router.delete('/:id',deleteCar);
router.put('/:id',updateCar);
module.exports=router;

