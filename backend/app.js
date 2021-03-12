const express = require('express');
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require("mongoose");
const User = require('./models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const multer = require('multer')
const http = require('http').createServer(express);
const io = require('socket.io')(http);
const nml = require('nodemailer');
const mailer = require('./mailer');
const user = require('./models/user');
const dotenv = require('dotenv').config();
const signup = require('./routes/signup')
const login = require('./routes/login')
const passwordreset = require('./routes/passwordreset')



app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


app.get('/', (req, res) => {
  // res.sendFile(__dirname + '/index.html');
  res.send('Aizon\'s B.E Server Here. How may I help you?')
});

// CHECKING FOR CONNECTION
io.on('connection', (socket) => {
  console.log('a user connected');
});

// MONGOOSE CONNECTION

mongoose
  .connect( process.env.MONGO_DB_URI, {useNewUrlParser: true, useUnifiedTopology: true,})
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((err) => {
    console.log(err);
  });


  // USER SIGNUP
app.post('/api/users/signup', signup.signup);

// VERIFICATION CHECK
app.get('/api/users/verify', signup.verify);

// PASSWORD CHANGE REQUEST
let passtoken = ''
let passwordmail = ''
let passman = false
app.post('/api/users/passresetrequest', passwordreset.passwordresetrequest)

// PASSWORD RESET
app.get('/api/users/passreset', passwordreset.passwordreset)



// Signup Confirmation 
app.get('/api/users/signup',signup.signupmsg)


let oof = 'oof'

// USER LOGIN
let log = false
let loggedUser = {oof};
app.post('/api/users/login', login.login)

// Login Confirmation 
app.get('/api/users/login', login.logaccess)


// USER PROFILE DISPLAY

app.get('/api/currentuser', login.profile)

// USERNAME MODIFICATION
app.post('/api/users/usermod', (req, res, next) => {
  loggedUser.username = req.body.username,
  console.log(req.body)
  loggedUser
    .save()
    .then(result => {
      res.status(201).json({
        message: "User modified!",
        result: result
      });
    })

})
module.exports = app

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})



// ADD FRIEND 
let fetchedfriend
app.post('/api/users/friendadd', (req, res, next) => { 
  console.log('Fetched User', loggedUser) 
  User.findOne({username: req.body.username})
  .then( user => {
    if (!user){
      return res.status(401).json({
        message: 'Username not recognized'
      });
    };
    fetchedfriend = user
    if (!user.friends){
      user.friends =[]      
    }
    if (!loggedUser.friends){
      loggedUser.friends =[]      
    }
    user.friends.push(loggedUser._id)
    loggedUser.friends.push(fetchedfriend._id)
    user.save()
    loggedUser.save()
    return res.status(200).json({
      message: 'Friend Added',
      friend: user.username
    })
  })
})