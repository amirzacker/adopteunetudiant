const User = require("./users.model");
const bcrypt = require("bcrypt");

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
    const user = await User.findOne({ email });
    if (!user) {
      return false;
    }
    const bool = await bcrypt.compare(password, user.password);
    if (!bool) {
      return false;
    }
    return user._id;
  }
}

module.exports = new UserService();
