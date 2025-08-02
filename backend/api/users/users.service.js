const User = require("./users.model");
const bcrypt = require("bcrypt");
const logger = require('../../utils/logger');
const LogMetadata = require('../../utils/logMetadata');
const PerformanceTracker = require('../../utils/performance');

class UserService {
  getAll() {
    //return User.find({}, "-password")
    return User.find({isStudent: true, status: true}, "-password")
  }
  getStudents() {
    //return User.find({}, "-password")
    return User.find({isStudent: true, status: true}, "-password")
  }
  getById(id) {
    //return User.findOne({email : id}, "-password");
    return User.findById(id, "-password");
  }
  getByEmail(email) {
    return User.findOne({email : email}, "-password");
    //return User.findById(id, "-password");
  }
  getByDomain(domain) {
    return User.find({domain: domain, isStudent: true, status: true }, "-password")
    //return User.find({isStudent: true, status: true}, "-password")
  }
 
  create(data) {
    const user = new User(data);
    return user.save();
  }
  update(id, data) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }
  delete(id) {
    return User.deleteOne({ _id: id });
  }

  async checkPasswordUser(email, password) {
    logger.debug('Password verification initiated',
      LogMetadata.createDbContext('findOne', 'users', { email: email.substring(0, 3) + '***' })
    );

    const user = await PerformanceTracker.measureDbQuery(
      'findOne', 'users',
      () => User.findOne({ email }),
      { operation: 'password_check', email: email.substring(0, 3) + '***' }
    );

    if (!user) {
      logger.debug('Password verification failed: User not found',
        LogMetadata.createDbContext('findOne', 'users', {
          email: email.substring(0, 3) + '***',
          result: 'user_not_found'
        })
      );
      return false;
    }

    const timer = PerformanceTracker.startTimer('PASSWORD_COMPARISON', {
      userId: user._id,
      operation: 'bcrypt_compare'
    });

    const bool = await bcrypt.compare(password, user.password);
    timer.stop({ success: bool });

    if (!bool) {
      logger.debug('Password verification failed: Invalid password',
        LogMetadata.createDbContext('password_check', 'users', {
          userId: user._id,
          result: 'invalid_password'
        })
      );
      return false;
    }

    logger.debug('Password verification successful',
      LogMetadata.createDbContext('password_check', 'users', {
        userId: user._id,
        result: 'success'
      })
    );

    return user._id;
  }
}

module.exports = new UserService();
