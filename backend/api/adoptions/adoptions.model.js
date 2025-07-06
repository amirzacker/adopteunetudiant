const { Schema, model } = require("mongoose");

const adoptionSchema = Schema({
  adopter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  adopted: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  }
}, { timestamps: true } );

module.exports = model("Adoption", adoptionSchema);
