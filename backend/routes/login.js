const bcrypt = require('bcrypt')
const dotenv = require('dotenv').config();
const user = require('../models/user');
const User = require('../models/user')
const jwt = require('jsonwebtoken');




let oof = 'oof'
let log = false
let loggedUser = {oof};

// USER LOGIN
exports.login = function(req, res, next) {  
  User.findOne({email: req.body.email})
  .then( user => {
    if (!user){
      return res.status(401).json({
        message: 'Email not recognized'
      });
    };

    if (user.status != 'verified'){
      return res.status(401).json({
        message: 'User Not Verified'
      });
    }
    loggedUser = user
    return bcrypt.compare(req.body.password, user.password);
  })
  .then (result => {
    if(!result){
      return res.status(401).json({
        message: 'Password Does Not Match'});
    }
    const token = jwt.sign({email: loggedUser.email, userId: loggedUser._id},
      process.env.PASSWORD,
      {expiresIn:'1h'})
    res.status(200).json({
      token: token,
      status: 'verified',
      message: 'Logged in'
    })
    log = true
    console.log('Logged in')
  })
  .catch(err => {
    return res.status(401).json({
      message: err });
  })
}

// LOGIN MSG
exports.logaccess = function(req, res, next) {
  if (log){
    res.status(200).json({
      message: 'Logged in!'
    })
  }
}

// USER PROFILE DISPLAY
exports.profile = function(req, res, next){
  res.status(200).json({
    message: 'This is the user',
    username: loggedUser.username,
    email: loggedUser.email,
    _id: loggedUser._id
  }) 

}