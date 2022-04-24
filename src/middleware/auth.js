const jwt = require('jsonwebtoken')
const register = require('../models/register')

const auth = async(req,res,next) =>
{
    try {
        const token = req.cookies.jwt_lg;
        const verify = jwt.verify(token,process.env.SECRET_KEY);
        // console.log(verify);
        const user = await register.findOne({_id:verify._id})
        // console.log(user.name);
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}
module.exports = auth;