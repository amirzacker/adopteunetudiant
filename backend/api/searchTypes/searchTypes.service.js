const SearchType = require("./searchTypes.schema");

class SearchTypeService {

  getAll() {
    return SearchType.find({});
  }
  create(data) {
    const searchType = new SearchType(data);
    return searchType.save();
  }
  update(id, data) {
    const searchType = SearchType.findByIdAndUpdate(id, data, { new: true });
    return searchType;
  }
  delete(id) {
    return SearchType.findByIdAndDelete(id);
  }
}

module.exports = new SearchTypeService();
