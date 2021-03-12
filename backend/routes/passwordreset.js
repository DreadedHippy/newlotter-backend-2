// CONSTS
const User = require('./../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const nml = require('nodemailer');
const dotenv = require('dotenv').config();




//VARS
let passtoken = ''
let passwordmail = ''
let passman = false


// PASSWORD REST REQUEST
exports.passwordresetrequest = async function (req, res, next) {
  const passreqToken = jwt.sign(
    {
      email: req.body.email,
    },
    process.env.PASSWORD,
    { expiresIn: 2000 * 60 } // 2 mins
  );
  console.log('Password reset request sent')
  passwordmail = req.body.email
  passman = true
  passtoken = passreqToken
  const user = await User.findOne({email: req.body.email})
  if(!user){
    return res.status(201).json({
      message: 'This user does not exist'
    })
  }
  const upd = await User.findByIdAndUpdate(user._id, {password_token: passreqToken})
  console.log(upd)
  passtokenmail(); 
  return res.status(201).json({
    message: "Password change request sent, Further instructions in mail."
  })
  // console.log(passtoken) 
};

// PASSWORD RESET EMAIL
let resetLink = ""
function passtokenmail(){
  try {
    if (passman)
    resetLink = "http://localhost:8100/newpass?token="+ passtoken + "&mail=" + passwordmail
    var transporter = nml.createTransport({
    service: 'gmail',
    auth: {
      user: 'aizon.mailer@gmail.com',
      pass: process.env.MAILPASS
    }
    });

    var mailOptions = {
      from: 'aizon.mailer@gmail.com',
      to: passwordmail,
      subject: 'Password Reset for Aizon inc.',
      html: '<h3>This email has requested a password reset</h3><br>'
        + '<p>Reset your password <a href='+ resetLink + ' target="_blank">Here</a></p>' 
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        state = "verified"
        return 'Sent'
      }
    });
  }

  catch (err) {
    console.log({message: 'verify error '+ err})
  } 
}

exports.passwordreset = async function (req, res, next) {
  const key = req.query.key
  console.log(key)
  const email = req.query.email
  console.log(email)
  const user = await User.findOne({password_token: key})
  console.log(user, 'user')
  if(!user){
    return res.status(500).json({
      message: 'The user did not request a password change'});
  }
  bcrypt.hash(req.query.password, 10).then(async hash => {
    const upd = await User.findByIdAndUpdate(
      user._id, {
        password: hash, 
        password_token: ''
      }
    )
    console.log(upd)
    res.status(201).json({
      message: 'Password changed',
      passkey: 'changed'
    })
  })


}