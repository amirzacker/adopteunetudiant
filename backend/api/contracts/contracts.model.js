const { Schema, model } = require("mongoose");

const contractSchema = Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "active", "terminated"],
    default: "pending"
  },
},{ timestamps: true } );

module.exports = model("Contract", contractSchema);
