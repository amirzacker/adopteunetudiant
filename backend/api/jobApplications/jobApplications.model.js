const { Schema, model } = require("mongoose");

const jobApplicationSchema = Schema({
  jobOffer: {
    type: Schema.Types.ObjectId,
    ref: "JobOffer",
    required: true,
    autopopulate: true
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    autopopulate: true
  },
  coverLetter: {
    type: String,
    required: [true, "Cover letter is required"],
    maxlength: 2000
  },
  resume: {
    type: String,
    required: [true, "Resume is required"]
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "accepted", "rejected"],
    default: "pending"
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String,
    maxlength: 1000
  },
  interviewDate: {
    type: Date
  },
  interviewNotes: {
    type: String,
    maxlength: 1000
  }
}, { timestamps: true });

// Ensure a student can only apply once to the same job offer
jobApplicationSchema.index({ jobOffer: 1, student: 1 }, { unique: true });

// Index for better query performance
jobApplicationSchema.index({ student: 1, status: 1 });
jobApplicationSchema.index({ jobOffer: 1, status: 1 });
jobApplicationSchema.index({ applicationDate: -1 });

// Pre-save middleware to update application count on job offer
jobApplicationSchema.post('save', async function() {
  const JobOffer = require('../jobOffers/jobOffers.model');
  const count = await model('JobApplication').countDocuments({ jobOffer: this.jobOffer });
  await JobOffer.findByIdAndUpdate(this.jobOffer, { applicationCount: count });
});

// Pre-remove middleware to update application count on job offer
jobApplicationSchema.post('deleteOne', { document: true, query: false }, async function() {
  const JobOffer = require('../jobOffers/jobOffers.model');
  const count = await model('JobApplication').countDocuments({ jobOffer: this.jobOffer });
  await JobOffer.findByIdAndUpdate(this.jobOffer, { applicationCount: count });
});

jobApplicationSchema.plugin(require('mongoose-autopopulate'));

module.exports = model("JobApplication", jobApplicationSchema);
