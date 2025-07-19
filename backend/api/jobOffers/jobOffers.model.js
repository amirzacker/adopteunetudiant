const { Schema, model } = require("mongoose");

const jobOfferSchema = Schema({
  title: {
    type: String,
    required: [true, "Job title is required"],
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, "Job description is required"],
    maxlength: 2000
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    autopopulate: true
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    maxlength: 100
  },
  requirements: {
    type: String,
    required: [true, "Requirements are required"],
    maxlength: 1000
  },
  publicationDate: {
    type: Date,
    default: Date.now
  },
  jobType: {
    type: Schema.Types.ObjectId,
    ref: "SearchType",
    required: true,
    autopopulate: true
  },
  domain: {
    type: Schema.Types.ObjectId,
    ref: "Domain",
    required: true,
    autopopulate: true
  },

  status: {
    type: String,
    enum: ["draft", "published", "closed"],
    default: "draft"
  },
  salary: {
    type: String,
    maxlength: 50
  },
  duration: {
    type: String,
    maxlength: 50
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  applicationDeadline: {
    type: Date
  },
  benefits: {
    type: String,
    maxlength: 500
  },
  workingHours: {
    type: String,
    maxlength: 100
  },
  applicationCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for better search performance
jobOfferSchema.index({ title: 'text', description: 'text', location: 'text' });
jobOfferSchema.index({ status: 1, publicationDate: -1 });
jobOfferSchema.index({ company: 1, status: 1 });
jobOfferSchema.index({ domain: 1, jobType: 1, status: 1 });

jobOfferSchema.plugin(require('mongoose-autopopulate'));

module.exports = model("JobOffer", jobOfferSchema);
