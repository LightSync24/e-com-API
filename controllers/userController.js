/* const getAllUsers = async (req, res) => {
  res.send("get all users");
};
const getSingleUser = async (req, res) => {
  res.send("get single users");
};
const showCurrentUser = async (req, res) => {
  res.send("show current user");
};
const updateUser = async (req, res) => {
  // res.send("update users");
  res.json(req.body);
};
const updateUserPassword = async (req, res) => {
  // res.send("update user pwd");
  res.json(req.body);
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}; */

/* --------------------------------------------------------------------------------------------------------- */
/* const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { createTokenUser, attachCookiesToResponse } = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  // console.log(users);
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  // req.user will be obtained through middleware 'authenticateUser' which we passed in the router
  res.status(StatusCodes.OK).json({ user: req.user });
};

// --------------------------------update user with findOneAndUpdate-----------------------------------
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError("please provide name and email");
//   }

//   // req.user will be obtained through middleware 'authenticateUser' which we passed in the router
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   ); // updating the user values

//   // creating a new token for the updated email and name
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };

// ---------------------------------update user with user.save()---------------------------------------------------
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("please provide name and email");
  }

  const user = await User.findOne({ _id: req.user.userId });

  // manually changing the value
  user.email = email;
  user.name = name;

  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
// this causes the pwd to update as well, the fix is implemented in the user model, see for reference

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both the values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }

  // if user passes all the checks
  user.password = newPassword; // update all the pwds
  await user.save(); // save the user
  res.status(StatusCodes.OK).json({ msg: "success! Password Updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}; */


/* -------------------------------------------------------------------------------------------------------------------------- */

// currently, via the getSingleUser, one user can access another user's info as long as he gets the _id of the other user, we want to fix that
// issue so that one user cannot access another user's data

// for doing so, we will setup a utils function, where we will check for the permissions
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { createTokenUser, attachCookiesToResponse, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: id }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${id}`);
  }
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError("please provide name and email");
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    { new: true, runValidators: true }
  ); 
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};


const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both the values");
  }

  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }
  user.password = newPassword; 
  await user.save(); 
  res.status(StatusCodes.OK).json({ msg: "success! Password Updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
