const express =require('express');
const router= express.Router();
const { createCar , getCars , deleteCar, getCarById , updateCar , searchCarsByPlate , attachCategoriesToCar} = require('../controllers/carController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

//routes for clients+ admins which can be public
router.get('/',getCars);
router.get('/search/:plate',searchCarsByPlate);
router.get('/:id',getCarById);
//routes for only admin and require authentication
router.post('/', requireAuth, requireRole(['admin']),upload.single('imageUrl'), createCar);
router.delete('/:id',requireAuth, requireRole(['admin']), deleteCar);
router.put('/:id',requireAuth, requireRole(['admin']), upload.single('imageUrl'),updateCar);
router.put('/:id/categories',requireAuth,requireRole(['admin']),attachCategoriesToCar);
module.exports=router;

