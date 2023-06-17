const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
let { randomString, validateEmail } = require('../common/globalFunction.js');
const { sendOtp, sendPassword } = require('../common/mailer');

//Signup controller
let signUp = async (req, res) => {
    try {
        let userEmail = req.body.email;
        let validEmail = await validateEmail(userEmail)
        if (!validEmail) {
            return res.status(200).send({ 
                success: false, 
                error: { 
                    errorCode: 1001,
                    message: 'Please enter valid Email address' 
                },
                response: null })
        }
        const userData = await User.findOne({ email: userEmail }, { userId: 1, email: 1, isActive: 1, isVerify: 1 });
        if (userData) {
            return res.status(200).send({
                success: false,
                error: {
                    errorCode: 1002,
                    message: `User with email: ${req.body.email} is already registered!`
                },
                response: { user: userData }
            })
        }

        let referal = req.body.referalCode? req.body.referalCode: null;
        if(req.body && referal){
            let referedUser = await User.findOneAndUpdate({ referalCode: referal }, { $push: { userRefered: req.body.email } }, { new: true })
            if(referedUser && referedUser.referalCode === referal){
                req.body['referrer'] = referal;
            }else{
                return res.status(200).send({
                    success: false,
                    error: {
                        errorCode: 1011,
                        message: `Invalid Referal code`
                    },
                    response: null
                })
            }
        }

        const otp = randomString(6);
        req.body['otp'] = otp;

        const uniqueId = randomString(7);
        req.body['userId'] = uniqueId;

        const referalCode = randomString(8);
        req.body['referalCode'] = referalCode;

        const user = new User(req.body);
        await user.save();

        await sendOtp(userEmail, otp)
        return res.status(201).send({ success: true, error: null, response: { message: 'OTP sent successfully on mail', validUser: true } });
    } catch (e) {
        return res.status(400).send(e);
    }
};

//login controller
let login = async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        if (!user.status) {
            return res.status(400).send({
                success: false,
                error: { errorCode: 1003, message: user.message },
                response: null
            });
        }
        const token = jwt.sign({ email: user.data.email, userId: user.data.userId }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });

        return res.status(200).send({
            success: true,
            error: null,
            response: { authSuccess: true, token: token, userId: user.data.userId, messages: "User successfully login" }
        });
    } catch (err) {
        return res.status(400).send({ success: false, error: { message: err }, response: null });
    }
};

//Get single user controller
let getUser = async (req, res) => {
    try {
        let userData = await User.findOne({ email: req.body.email })
        if (!userData) {
            return res.status(400).send({ success: false, error: { errorCode: 1004, message: 'User not found, Please Signup' }, response: null, });
        }
        return res.status(200).send({ success: true, error: null, response: { User: userData, token: req.token } });
    } catch (err) {
        return res.status(500).send({ success: false, error: { errorCode: 1005, message: "Error getting user details" }, response: null });
    }
};

//update user details controller
let updateUser = async (req, res) => {
    let { firstName, lastName, password, email } = req.body
    try {
        if (password) {
            password = await bcrypt.hash(password, 10);
        }
        let userUpdate = await User.findOneAndUpdate({ _id: req.params.id }, { firstName, lastName, email, password }, { new: true })
        return res.status(200).send({ success: true, error: null, response: { user: userUpdate, message: "user updated successfully" } });
    } catch (err) {
        return res.status(400).send({ success: false, error: { message: err }, response: null });
    }
};

//forgetPassword user controller
let forgetPassword = async (req, res) => {
    try {
        let { email } = req.body
        let userData = await User.findOne({ email }, { userId: 1, email: 1, isActive: 1, isVerify: 1 })
        if (!userData) {
            return res.status(400).send({ success: false, error: { errorCode: 1006, Message: 'User not found, Please Signup' }, response: null });
        }

        let defaultPassword = randomString(10);
        await sendPassword(email, defaultPassword)
        defaultPassword = await bcrypt.hash(defaultPassword, 10);

        let userUpdate = await User.findOneAndUpdate({ _id: userData._id }, { password: defaultPassword }, { new: true })
        return res.status(200).send({ success: true, error: null, response: { user: userData, message: "Default password sent on email, Please use to upadte new password" } });
    } catch (err) {
        return res.status(500).send({ success: false, error: { message: err }, response: null });
    }
};

//resetPassword user controller
let resetPassword = async (req, res) => {
    try {
        let { defaultPassword, newPassword, email } = req.body
        let userData = await User.findByCredentials(email, defaultPassword);
        if (!userData.status) {
            return res.status(400).send({ success: false, error: { errorCode: 1007, message: userData.message }, response: null });
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        let userUpdate = await User.findOneAndUpdate({ _id: userData.data._id }, { password: hashedPassword }, { new: true })
        return res.status(200).send({ success: true, error: null, response: { message: "Password updated successfully" } });
    } catch (err) {
        return res.status(500).send({ success: false, error: { message: err }, response: null });
    }
};

//verify user with otp controller
let verifyOtp = async (req, res) => {
    let { email, otp } = req.body
    try {
        let userData = await User.findOne({ email })
        if (!userData) {
            return res.status(400).send({
                success: false,
                error: {
                    errorCode: 1008,
                    message: 'User not found, Please Signup'
                },
                response: null
            });
        }
        if (userData.isVerify) {
            return res.status(400).send({
                success: false,
                error: {
                    errorCode: 1009,
                    message: "User is already verified"
                },
                response: null
            });
        }
        if (userData.otp === otp) {
            let userUpdate = await User.findOneAndUpdate({ email }, { isVerify: true }, { new: true })
            if (userUpdate) {
                return res.status(200).send({ success: true, error: null, response: { User: userUpdate, message: "User verified successfully" } });
            }
        } else {
            return res.status(400).send({
                success: false,
                error: {
                    errorCode: 1010,
                    message: "OTP not match"
                },
                response: null
            });
        }
    } catch (err) {
        return res.status(500).send({ success: false, error: { message: "Error verifying otp of user" }, response: null });
    }
};

module.exports = { signUp, login, updateUser, getUser, verifyOtp, forgetPassword, resetPassword };