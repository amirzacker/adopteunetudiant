const { Schema, model } = require("mongoose");

const domainSchema = Schema({
  name: {
    type: String,
    required: [true, "Domain's name is required"],
    unique: true,
  },
}, { timestamps: true } );

let Domain;


module.exports = Domain = model("Domain", domainSchema);


