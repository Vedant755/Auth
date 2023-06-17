const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

let auth = async (req, res, next)=>{
    try{
        let token = null;
        if (req && req.cookies) {
            token = req.header('Authorization').replace('Bearer ', '');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email : decoded.email });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    }catch(err){
        res.status(401).send({ Error: "Please authenticate." });
    }
}
module.exports = auth;