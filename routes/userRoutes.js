/* const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

router.route("/").get(getAllUsers);
router.route("/showMe").get(showCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(updateUserPassword);

router.route("/:id").get(getSingleUser); // req.param will be placed in the end, because if its placed above the others
// express will see 'showMe', 'updateUser' and 'updateUserPassword' as the 'id' param

module.exports = router;
 */


/* --------------------------------------------------------------------------------------------------------------------------------------- */
// adding in the authentication middleware
const express = require("express");
const router = express.Router();
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userController");

// router.route("/").get(authenticateUser,  getAllUsers);
router.route("/").get(authenticateUser, authorizePermissions('admin', 'owner'), getAllUsers);
// abb yahan par authorizePermissions ek function hai which we invoke the function immediately and hum usko call kare toh issue aaega, but jab hum authorizePermission ko define karenge
// toh usse hum ek func return karwa denge, jisse it will become a callback func and it will work fine
router.route("/showMe").get(authenticateUser,showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser,updateUserPassword);

router.route("/:id").get(authenticateUser, getSingleUser); 

module.exports = router;
