const {UnauthorizedError } = require('../utils/errors/');
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../api/users/users.model");


module.exports = async (req, res, next) =>  {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      throw "not token";
    }
    const decoded = jwt.verify(token, config.secretJwtToken);
    var userId = decoded.userId;
        const user = await User.findById(userId, "-password");
        req.user = user;
    next();
  } catch (message) {
    next(new UnauthorizedError(message));
  }
};
