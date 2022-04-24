
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerSchema = new mongoose.Schema({
    name : {
        type : String,
        required:true,
        
    },
    email : {
        type : String,
        required:true

    },
    phone: {
        type : Number,
        required:true

    },
    password: {
        type : String,
        required : true


    },
    cpassword: {
        type : String
    },
    tokens : [
        {
            token : {
                type : String,
                required : true
            }
        }
    ]
})
// generating token
registerSchema.methods.generateAuthToken = async function()
{
    try
    {
        // console.log(this._id.toString());
        const token =  jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token})
        await this.save();
        return token;
    }
    catch(err)
    {
        res.send(err);
        console.log(err);
    }
}
//password hashing
registerSchema.pre('save',async function(next)
{
    if(this.isModified('password'))
    {
        this.password = await bcrypt.hash(this.password,10);
        this.cpassword = undefined;
    }
    next()
})

const Register = new mongoose.model("Register",registerSchema);

module.exports = Register;