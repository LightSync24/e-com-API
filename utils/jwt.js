/* const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  createJWT,
  isTokenValid,
};
 */

/* ----------------------------------------------------------------------------------------------------------------------------- */

const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);


// attaching cookie to the response 
const attachCookiesToResponse = ({ res, user }) => {
  // since we will be attaching cookie to the response, we want the response object, hence the reason for passing 'res' in the param
  // creating the token
  const token = createJWT({ payload: user });
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),

    // some additional properties
    secure: process.env.NODE_ENV === 'production',
    signed: true
  });

  // res.status(201).json({ user });
};
module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
