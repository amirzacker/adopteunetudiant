const { Schema, model } = require("mongoose");

const searchTypesSchema = Schema({
  name: {
    type: String,
    required: [true, "searchType's name is required"],
    unique: true,
  },
}, { timestamps: true } );

let SearchType;

module.exports = SearchType = model("SearchType", searchTypesSchema);


