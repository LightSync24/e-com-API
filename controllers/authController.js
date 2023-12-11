/* const register = async (req, res) => {
  res.send("Registered");
};

const login = async (req, res) => {
  res.send("User login");
};
const logout = async (req, res) => {
  res.send("User logout");
};

module.exports = { register, login, logout }; */

/* ---------------------------------------------------------------------------------------------------------------------------------------- */

/* const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const register = async (req, res) => {
  // const { name, email, password, role } = req.body;
  // const { email } = req.body;
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });

  // verifying unique email addrs
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      `Email id ${email} is already registered`
    );
  }

  // const user = await User.create({name, email, password});
  // // now in this case, we want our users to have 'user', so even if they do pass in their role as 'admin', they will be created as a 'user' since the
  // // 'user' is the default for role (in the schema), as we arent passing in the role while creating in the database
  // res.status(StatusCodes.CREATED).json({ user });

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  // after setting this up, we made it so that only the first registered user will be the admin, all else will be 'user' even if they enter their
  // role as 'admin'

  const user = await User.create({ name, email, password, role });
  res.status(StatusCodes.CREATED).json({ user });
};
// the password encryption is done in the user schema


const login = async (req, res) => {
  res.send("User login");
};
const logout = async (req, res) => {
  res.send("User logout");
};

module.exports = { register, login, logout }; */

/* ---------------------------------------------------------------------------------------------------------------------------------------- */
// CREATING WEB TOKENS

// require("dotenv").config();
// const User = require("../models/User");
// const { StatusCodes } = require("http-status-codes");
// const CustomError = require("../errors");
// const jwt = require("jsonwebtoken");

// const register = async (req, res) => {
//   const { email, name, password } = req.body;
//   const emailAlreadyExists = await User.findOne({ email });

//   if (emailAlreadyExists) {
//     throw new CustomError.BadRequestError(
//       `Email id ${email} is already registered`
//     );
//   }

//   const isFirstAccount = (await User.countDocuments({})) === 0;
//   const role = isFirstAccount ? "admin" : "user";

//   const user = await User.create({ name, email, password, role });

//   // issuing the token
//   const tokenUser = { name: user.name, userId: user._id, role: user.role }; // the payload for token generation
//   // const token = jwt.sign(tokenUser, "jwtscecret", { expiresIn: "1d" });
//   const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });
//   res.status(StatusCodes.CREATED).json({ user: tokenUser, token });
// };

// const login = async (req, res) => {
//   res.send("User login");
// };
// const logout = async (req, res) => {
//   res.send("User logout");
// };

// module.exports = { register, login, logout };

/* ------------------------------------------------------------------------------------------------------------------------- */

// creating the jwt in another folder(utils) and importing in here
require("dotenv").config();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { createJWT, isTokenValid } = require("../utils/index");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError(
      `Email id ${email} is already registered`
    );
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  const token = createJWT({ payload: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser, token });
};

const login = async (req, res) => {
  res.send("User login");
};
const logout = async (req, res) => {
  res.send("User logout");
};

module.exports = { register, login, logout };
