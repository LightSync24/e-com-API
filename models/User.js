const mongooose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongooose.Schema({
  name: {
    type: String,
    required: [true, "Please Provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide Email"],
    //previously, we used a regex for validating the info the info, however, mongoose provides a validator prop as well
    validate: {
      // this is a prop: this is done using the packages imported above
      validator: validator.isEmail,
      message: "Email is not valid",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

// encrypting the value of the user password
// UserSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// the changes we made for using the user.save in updateUser controller
UserSchema.pre("save", async function () {
  if(!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// comparing the user-entered password from the password in the DB
UserSchema.methods.comparePassword = async function (candidatePwd) {
  const isMatch = bcrypt.compare(candidatePwd, this.password);
  return isMatch;
};

module.exports = mongooose.model("User", UserSchema);
