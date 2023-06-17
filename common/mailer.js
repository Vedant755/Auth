let nodemailer = require('nodemailer');
const User = require('../models/user.model');

let sendOtp = (email, otp) => {
    console.log('insde sendtotp', email,otp);
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email: email })
            if (user) {
                let smtpTransport = nodemailer.createTransport({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    auth: {
                        user: 'apikey',
                        pass: process.env.SEND_GRID_KEY
                    },
                    tls: { rejectUnauthorized: false },
                });
                smtpTransport.sendMail({
                    from: 'info@bullniveza.com',
                    to: email,
                    subject: 'Email Verification!',
                    html: `<!doctype html> <html> <body> OTP to verify account <p> <strong> ${otp} </strong> </p> </body> </html>`,
                }, function (error, info) {
                    if (error) {
                        console.log('error',error);
                        reject(error)
                    }
                    console.log('Message sent: ' + JSON.stringify(info));
                    resolve(info)
                });
            }
        } catch (err) {
            console.log('catch error',err)
            reject(err);
        }
    })
}

let sendPassword = (email, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ email: email })
            if (user) {
                let smtpTransport = nodemailer.createTransport({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    auth: {
                        user: 'apikey',
                        pass: process.env.SEND_GRID_KEY
                    },
                    tls: { rejectUnauthorized: false },
                });
                smtpTransport.sendMail({
                    from: 'info@bullniveza.com',
                    to: email,
                    subject: 'Forget password!',
                    html: `<!doctype html> <html> <body> Please use this Password to login to your account and using this you can also update your new password <p> <strong> ${otp} </strong> </p> </body> </html>`,
                }, function (error, info) {
                    if (error) {
                        console.log('error',error);
                        reject(error)
                    }
                    console.log('Message sent: ' + JSON.stringify(info));
                    resolve(info)
                });
            }
        } catch (err) {
            console.log('catch error',err)
            reject(err);
        }
    })
}

module.exports = { sendOtp, sendPassword }