/* const express =  require('express');
const CustomError = require('../errors')
const {isTokenValid} = require('../utils')

const authenticateUser = async (req, res, next) =>{
    const token = req.signedCookies.token; // we are looking for token, because we named the cookie as 'token' while attaching it to the response
    if(!token){
        throw new CustomError.UnauthenticatedError('Authentication failed');
    }
    try {
        const {name, userId, role}= isTokenValid({token});
        // console.log(payload);
        req.user = {name, userId, role}
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication failed'); 
    }
    next();
}

module.exports = {authenticateUser} */

/* ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ */
// we can authenticate the user, now authorize the permissions

const express = require("express");
const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token; // we are looking for token, because we named the cookie as 'token' while attaching it to the response
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication failed");
  }
  try {
    const { name, userId, role } = isTokenValid({ token });
    // console.log(payload);
    req.user = { name, userId, role };
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication failed");
  }
  next();
};

// const authorizePermissions = (req, res, next) => {
//   // console.log("admin route");
//   if (req.user.role != "admin ") { // we will have access to req.user as it was passed onto the next middleware by the authenticateUser
//     throw new CustomError.UnauthorizedError("Unauthorized to access this route");
//   }
//   next();
// };
// first we checked whether the user existed, then we checked whether the user is admin

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        "unauthorized to access this route"
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizePermissions };
