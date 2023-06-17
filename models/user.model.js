const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		trim: true
	},
	lastName: {
		type: String,
		trim: true
	},
	userId: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		trim: true
	},
	phone: {
		type: String,
		trim: true
	},
	isActive: { 
		type: Boolean, 
		default: true 
	},
	isVerify: { 
		type: Boolean, 
		default: false 
	},
	otp:{
		type: String,
		trim: true
	},
	referalCode: {
		type: String,
		trim: true
	},
	referrer: {
		type: String,
		trim: true,
		default: null
	},
	userRefered: {
		type: [String],
		trim: true,
	}
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email });
	console.log(user);
    if (!user) {
        return { status : false, message: 'User not found, Please signup'}
    }
    const isMatch = await bcrypt.compare(password, user.password);
	console.log(isMatch);
    if (!isMatch) {
        return { status : false, message: 'Password not match, Try again'}
    }
    return { status : true, data: user}
}

const User = mongoose.model('User', userSchema);
module.exports = User;