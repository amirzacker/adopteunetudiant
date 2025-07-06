const Adoption = require("./adoptions.model");

class AdoptionService {
  async create(adopterId, adoptedId) {
    const adoption = new Adoption({
      adopter: adopterId,
      adopted: adoptedId,
    });
    return adoption.save();
  }

  async getAll(userId) {
    return Adoption.find({ $or: [{ adopter: userId }, { adopted: userId }] })
      .populate("adopter")
      .populate("adopted");
  }

  async getAllRejected(userId) {
    return Adoption.find({
      $or: [{ adopter: userId }, { adopted: userId }],
      status: "rejected",
    })
      .populate("adopter")
      .populate("adopted");
  }

  async getAllAccepted(userId) {
    return Adoption.find({
      $or: [{ adopter: userId }, { adopted: userId }],
      status: "accepted",
    })
      .populate("adopter")
      .populate("adopted");
  }

  async updateAccepted(adoptionId) {
    return Adoption.findByIdAndUpdate(adoptionId, { status: "accepted" });
  }

  async updateRejected(adoptionId) {
    return Adoption.findByIdAndUpdate(adoptionId, { status: "rejected" });
  }
  async historyAdoption(companyId, studentId) {
    return Adoption.findOne({ adopter: companyId, adopted: studentId , status: "accepted"}).populate("adopter")
    .populate("adopted");
     
  }

  async findAdoption(companyId, studentId) {
    const adoption = await Adoption.findOne({
      adopter: companyId,
      adopted: studentId,
    }).populate("adopter adopted");
  
    return adoption;
  }
  

  async deleteAdoption(adoptionId) {
    return Adoption.findOneAndDelete({ _id: adoptionId });
  }
}

module.exports = new AdoptionService();
