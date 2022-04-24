require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const port = process.env.PORT || 8000;
require('./db/connection');
const Register = require('./models/register');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')



//using buit-in middlewire,(static folder)
app.use(express.static(path.join(__dirname,'../public')))
app.set('view engine','hbs');// set the view engine
app.set('views',path.join(__dirname,"../templates/views")) // set the views folder path
hbs.registerPartials(path.join(__dirname,"../templates/partials")) // register the partials

app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({extended:false}))


app.get("/",(req,res) =>
{
    res.render('index');
});
app.post("/index",async(req,res) =>
{
    const pass = req.body.password;
    const cpass = req.body.cpassword;

    try{
        if(pass === cpass)
        {
            const register = new Register({
                name : req.body.name,
                email : req.body.email,
                phone : req.body.phone,
                password : pass,
                cpassword : cpass
            })
            const token = await register.generateAuthToken();
            res.cookie("jwt_rg",token,{
                expires : new Date(Date.now() + 300000),
                httpOnly:true
            })
            await register.save();
            res.status(201).render('index');
        }
        else
        {
            res.status(400).send('Password not matching');
        }
    }
    catch(err)
    {
        res.status(404).send(err);
    }
})
app.get("/login",(req,res) => {
    res.render('login')
})
//login validation
app.post("/login",async(req,res) =>
{
    try
    {
        const email = req.body.email;
        const password = req.body.password;
        const mResult = await Register.findOne({email}) 
        if(mResult)
        {
            
            const isMatch = await bcrypt.compare(password,mResult.password)
            if( isMatch)
            {
                const token = await mResult.generateAuthToken();
                res.cookie('jwt_lg',token,{
                    expires : new Date(Date.now() + 300000),
                    httpOnly : true,
                    // secure : true
                })
                res.status(200).render('index');
            }
            else
            {
                res.status(404).send('Incorrect Password')
            }
        }
        else
        {
            res.status(400).send('You are not registered User, Before login please register');
        }
    }
    catch(err)
    {
        res.status(400).send(err);
    }
})
app.get("/register",(req,res) => {
   
    res.render('registration')
})
app.get('/secret',auth,(req,res) =>
{
    res.render('secret')
})
app.get('/logout',auth,async(req,res) =>
{
    try {
        console.log(req.user);
        // res.clearCookie("jwt_lg");
        // logout from one device
        // req.user.tokens = req.user.tokens.filter((element) =>
        // {
        //     return req.token !== element.token;
        // })
        // logout from all devices
        req.user.tokens = [];
        res.cookie("jwt_lg",'',{expires:new Date(Date.now()),domain:'localhost',path:'/'})
        await req.user.save();
        res.render('index');
    } catch (error) {
        res.status(500).send(error)
    }
})

app.listen(port,() => console.log('Server is ready to listen'));