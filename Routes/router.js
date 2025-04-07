const express = require('express');
const router = new express.Router()

const productController = require('../Controllers/productController');
const userController = require('../Controllers/userController');
const adminController = require('../Controllers/adminController')
const jwtmiddleware = require('../Middleware/jwtMiddleware');
const multerConfig = require('../Middleware/multerMiddleware')

// defining paths
router.get('/all-products', productController.getAllProductsController);
// user
router.post('/user-register', userController.registerController);
router.post('/user-login', userController.loginController);
router.get('/all-users', userController.getAllUserController);
router.delete('/delete-user/:id', userController.deleteByIdController);
router.get('/my-profile', jwtmiddleware,multerConfig.single('pic'), userController.getUserDetailsController);
router.put('/my-profile-update',jwtmiddleware,multerConfig.single('pic'),userController.updateUserProfileController);
// products
router.post('/add-products', jwtmiddleware, multerConfig.single('imageUrl'), productController.addProductController);
router.post('/place-bid/:id', productController.placeBidController);
router.put('/update-product/:id',jwtmiddleware, multerConfig.single('imageUrl'),productController.updateProductController);
router.delete('/delete-product/:id', productController.deleteProductController);
router.get('/product-details/:id', productController.getProductDetailsByIdController);
router.delete('/deleteProduct/:id', productController.deleteByIdController);
router.get('/my-product',jwtmiddleware,productController.getUserProductController);
// Bidding
router.post('/bid-product',jwtmiddleware,productController.addBidController);
router.get('/bids/highest/:id',productController.getBiddingProductController);
router.get('/bid/status/:id',jwtmiddleware,productController.getUserBidHistoryController);
// admin
router.post('/admin-login', adminController.adminLoginController);
router.get('/admin-details', adminController.getAdminDetailsController);
router.put('/admin-update', multerConfig.single('pic'), adminController.updateAdminDetailsController);
// payment
router.post('/make-payment',jwtmiddleware,productController.createPaymentController);
router.get('/payment-details',jwtmiddleware,productController.getUserPaymentsController);
module.exports = router;