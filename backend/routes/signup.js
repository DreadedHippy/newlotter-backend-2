const jwt = require('jsonwebtoken');
const User = require('../models/user')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv').config();
const user = require('../models/user');
const nml = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;


const myOAuth2Client = new OAuth2(
  "44589431036-r7s0ls43f19bk3f56td9bqv6la1r6epf.apps.googleusercontent.com",
  "dlhdE8DicVpQ11oST0iBz9wu",
  "https://developers.google.com/oauthplayground"
)

let reg = false
let newman = false
var mail = "email.mail"
let token = ""
let status =  "pending"

// USER SIGNUP
exports.signup = function(req, res, next) {
  const verifyToken = jwt.sign(
    {
      email: req.body.email,
      name: req.body.name,
    },
    process.env.PASSWORD,
    { expiresIn: 2000 * 60 } // 2 mins
  );
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      friends: req.body.friends,
      token: verifyToken
    });    
    console.log('User created! Please Verify with E-mail Link')
    reg = true
    newman = true
    mail = user.email
    token = verifyToken 
    status = 'pending'
    user
      .save()
      .then(result => {
        validation();
        res.status(201).json({
          email: user.email,         
          message: "User created! Please Verify with E-mail Link.",
          status: 'pending',
          result: result
        });
        console.log(token);       
      })
      .catch(err => {
        res.status(500).json({
          error: err
        });
      });
  });
}

// Email Verification 
let verifLink = ""
function validation(){
  try {
    if (newman)
    myOAuth2Client.setCredentials({
      refresh_token:"1//04qApxRrWftI5CgYIARAAGAQSNwF-L9IrPs31PPRImenZaPjsMcLzkiVI-WXndwq2VAirfJio72yg1YHwgqIf9PdgPc4jr9uS-ww"
    });
    const myAccessToken = myOAuth2Client.getAccessToken()
    verifLink = "http://localhost:8100/verification?key="+ token
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
           type: "OAuth2",
           user: "aizon.mailer@gmail.com",
           clientId: "44589431036-r7s0ls43f19bk3f56td9bqv6la1r6epf.apps.googleusercontent.com",
           clientSecret: "dlhdE8DicVpQ11oST0iBz9wu",
           refreshToken: "1//04qApxRrWftI5CgYIARAAGAQSNwF-L9IrPs31PPRImenZaPjsMcLzkiVI-WXndwq2VAirfJio72yg1YHwgqIf9PdgPc4jr9uS-ww",
           accessToken: myAccessToken
    }});

    const mailOptions = {
      from: 'aizon.mailer@gmail.com',
      to: mail,
      subject: 'Email Verification for Aizon inc.',
      html: '<h3>This email has signed up for Aizon Lotter</h3><br>'
        + '<p>Verifiy your Email <a href='+ verifLink + ' target="_blank">Here</a></p>' 
    }

    transport.sendMail(mailOptions,function(err,result){
      if(err){
        res.send({
          message:err
        })
      }else{
        transport.close();
        res.send({
          message:'Email has been sent: check your inbox!'
        })
      }
    })
  }

  catch (err) {
    console.log({message: 'verify error '+ err})
  } 
}

// SIGNUP CONFIRMATION 
exports.signupmsg = function(req, res, next) {
  if (reg){
    res.status(200).json({
      message: 'User created! Please verify with E-mail link.'
    })
  }
}

// VERIFICATION CHECK
exports.verify = async function(req, res, next) {
  try {
    const key = req.query.key
    console.log(key, 'key')
    const user = await User.findOne({token: key})
    console.log(user, 'user')
    if(!user){
      return res.status(500).json({
        message: 'The user does not exist'});
    }
    const upd = await User.findByIdAndUpdate(user._id, {token: '', status: 'verified'})
    console.log(upd)

    return res.status(201).json({
        status: 'verified',
        message : 'Your E-mail has been verified.'
        });
     
  }
  catch (err) {
    return res.status(500).json({message: 'verify error '+ err})
  }    
}