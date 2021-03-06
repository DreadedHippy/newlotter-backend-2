const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  friends: { type: Array},
  token: {type: String},
  password_token: {type: String},
  status: {
    type: String,
    default: "pending",
},
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
