const adoptionService = require("./adoptions.service");

class AdoptionController {
  async createAdoption(req, res, next) {
    try {
      const adoption = await adoptionService.create(
        req.body.adopterId,
        req.body.adoptedId
      );
      req.io.emit("adoption:create", adoption);
      res.status(201).json(adoption);
    } catch (err) {
      next(err);
    }
  }
  async getAllAdoptions(req, res, next) {
    try {
      const adoptions = await adoptionService.getAll(req.params.userId);
      res.json(adoptions);
    } catch (err) {
      next(err);
    }
  }
  async getAllRejectedAdoptions(req, res, next) {
    try {
      const adoptions = await adoptionService.getAllRejected(req.params.userId);
      res.json(adoptions);
    } catch (err) {
      next(err);
    }
  }
  async getAllAcceptedAdoptions(req, res, next) {
    try {
      const adoptions = await adoptionService.getAllAccepted(req.params.userId);
      res.json(adoptions);
    } catch (err) {
      next(err);
    }
  }
  async updateAcceptedAdoption(req, res, next) {
    try {
      const adoption = await adoptionService.updateAccepted(
        req.params.adoptionId
      );
      req.io.emit("adoption:update", adoption);
      res.json(adoption);
    } catch (err) {
      next(err);
    }
  }
  async updateRejectedAdoption(req, res, next) {
    try {
      const adoption = await adoptionService.updateRejected(
        req.params.adoptionId
      );
      req.io.emit("adoption:update", adoption);
      res.json(adoption);
    } catch (err) {
      next(err);
    }
  }
  async checkAdoptionHistory(req, res, next) {
    try {
      const adoption = await adoptionService.historyAdoption(
        req.params.companyId,
        req.params.studentId
      );
      res.json(adoption);
    } catch (err) {
      next(err);
    }
  }
  async findAdoption(req, res, next) {
    try {
      const adoption = await adoptionService.findAdoption(
        req.params.companyId,
        req.params.studentId
      );
      res.json(adoption);
    } catch (err) {
      next(err);
    }
  }
  async deleteAdoption(req, res, next) {
    try {
      const adoption = await adoptionService.deleteAdoption(
        req.params.adoptionId
      );
      req.io.emit("adoption:delete", adoption);
      res.json(adoption);
    } catch (err) {
      next(err);
    }
  }
}
module.exports = new AdoptionController();
