const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt');
const { signUp, login, updateUser, getUser, verifyOtp, forgetPassword, resetPassword } = require('../controllers/auth.controller.js');

//Signup route
router.post('/signup', signUp);
router.post('/login', login);
router.get('/user', auth, getUser);
router.patch('/updateUser/:id', auth, updateUser);
router.post('/verifyOtp', verifyOtp);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);

module.exports = router;