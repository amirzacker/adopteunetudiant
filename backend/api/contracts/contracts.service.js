const Contract = require("./contracts.model");


class ContractService {
  create(companyId, studentId, terms, startDate, endDate) {
    const contract = new Contract({
      company: companyId,
      student: studentId,
      terms: terms,
      startDate: startDate,
      endDate: endDate
    });
    return contract.save();
  }

  async getAll(userId) {
    return Contract.find({$or: [{ company: userId }, { student: userId }]}).populate('company').populate('student');
  }

  async getAllActive(userId) {
    return Contract.find({$or: [{ company: userId }, { student: userId }], status: 'active'}).populate('company').populate('student');
  }

  async getAllTerminated(userId) {
    return Contract.find({$or: [{ company: userId }, { student: userId }], status: 'terminated'}).populate('company').populate('student');
  }

  async updateActive(contractId) {
    return Contract.findByIdAndUpdate(contractId, { status: 'active' });
  }

  async updateTerminated(contractId) {
    return Contract.findByIdAndUpdate(contractId, { status: 'terminated' });
  }
  async historyContract(companyId, studentId) {
    return Contract.findOne({ company: companyId, student: studentId }).populate('company').populate('student');
     
  }

  async deleteContract(contractId) {
    return Contract.deleteOne({ _id: contractId })
  }
}

module.exports = new ContractService();
