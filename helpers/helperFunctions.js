module.exports = {
  searchResult: function (baseObject, search, property) {
    return baseObject?.find((objElement) => {
      if (!!property) {
        return objElement[property] == search;
      } else {
        return objElement == search;
      }
    });
  }
}