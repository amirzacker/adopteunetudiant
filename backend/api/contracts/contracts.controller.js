const contractService = require('./contracts.service');

class ContractController {

  async createContract(req, res, next) {
    try {
      const contract = await contractService.create(req.body.companyId, req.body.studentId, req.body.terms, req.body.startDate, req.body.endDate);
      res.status(201).json(contract);
    } catch (err) {
      next(err);
    }
  }

  async getAllContracts(req, res, next) {
    try {
      const contracts = await contractService.getAll(req.params.userId);
      res.json(contracts);
    } catch (err) {
      next(err);
    }
  }

  async getAllActiveContracts(req, res, next) {
    try {
      const contracts = await contractService.getAllActive(req.params.userId);
      res.json(contracts);
    } catch (err) {
      next(err);
    }
  }

  async getAllTerminatedContracts(req, res, next) {
    try {
      const contracts = await contractService.getAllTerminated(req.params.userId);
      res.json(contracts);
    } catch (err) {
      next(err);
    }
  }

  async updateActiveContract(req, res, next) {
    try {
      const contract = await contractService.updateActive(req.params.contractId);
      res.json(contract);
    } catch (err) {
      next(err);
    }
  }

  async updateTerminatedContract(req, res, next) {
    try {
      const contract = await contractService.updateTerminated(req.params.contractId);
      res.json(contract);
    } catch (err) {
      next(err);
    }
  }
  async checkContractHistory(req, res, next) {
    try {
      const contract = await contractService.historyContract(
        req.params.companyId,
        req.params.studentId
      );
      res.json(contract);
    } catch (err) {
      next(err);
    }
  }

  async deleteContract(req, res, next) {
    try {
      const contract = await contractService.deleteContract(
        req.params.contractId
      );
      req.io.emit("contract:delete", contract);
      res.json(contract);
    } catch (err) {
      next(err);
    }
  }

}

module.exports = new ContractController();
