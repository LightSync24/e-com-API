// now, instead of sending back the token with our response
// we will attach a 'cookie' to our response and we will store the JWT in there and only the browser can access that token

/* require("dotenv").config();
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

  // attaching the cookie
  const oneDay = 1000 * 60 * 60 * 24;
  // res.cookie(name, value [, options])
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay), 
  });

  // accessing the cookie in the server
  // everytime a broswer sends a req with a cookie, it can be accessed in 'req.cookies' (done using middleware 'cookie-parser' in app.js)
  // once is cookie is generated for the first time, the browser will automatically pick it up and send back to the server in next requests
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  res.send("User login");
};
const logout = async (req, res) => {
  res.send("User logout");
};

module.exports = { register, login, logout }; */

/* ---------------------------------------------------------------------------------------------------------------------------- */

// attaching cookies to response in a diff function, and then we will simply call it here, just to refactor the code and make it more readable
/* require("dotenv").config();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils/index");

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

  // attaching cookie to the response via a user-defined func
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  res.send("User login");
};
const logout = async (req, res) => {
  res.send("User logout");
};

module.exports = { register, login, logout }; */

/* ----------------------------------------------------------------------------------------------------------------------- */
// login and logout

/* require("dotenv").config();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils/index");

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
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(`Please provide email and password`);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError(
      `User with email id ${email} does not exist`
    );
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(`Password is incorrect`);
  }
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", { // we set the 'token' cookie to a string, this way we replace the 'token' with another value
    httpOnly: true,
    // expires: new Date(Date.now() + 5 * 1000), 
    expires: new Date(Date.now()), // the 'token' cookie expires as soon as we logout
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

module.exports = { register, login, logout }; */

/* -------------------------------------------------------------------------------------------------------------------------------- */
// invoking the createTokenUser

require("dotenv").config();
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils/index");

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
  const tokenUser = createTokenUser(user); // change made here
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(`Please provide email and password`);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError(
      `User with email id ${email} does not exist`
    );
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError(`Password is incorrect`);
  }
  const tokenUser = createTokenUser(user); // change made here as well
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};

module.exports = { register, login, logout };
