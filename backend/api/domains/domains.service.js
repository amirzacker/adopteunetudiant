const Domain = require("./domains.schema");

class DomainService {

  getAll() {
    return Domain.find({});
  }
  create(data) {
    const domain = new Domain(data);
    return domain.save();
  }
  update(id, data) {
    const domain = Domain.findByIdAndUpdate(id, data, { new: true });
    return domain;
  }
  delete(id) {
    return Domain.findByIdAndDelete(id);
  }
}

module.exports = new DomainService();
