module.exports = {
  searchResult: function (baseObject, search, property) {
    return baseObject?.find((objElement) => {
      if (!!property) {
        return objElement[property] == search;
      } else {
        return objElement == search;
      }
    });
  },
  findMany: function (
    baseObject,
    search,
    properties,
    options = { caseSentive: false }
  ) {
    return baseObject?.filter((objElement) => {
      return (
        !!properties &&
        !!properties.length &&
        properties.find((property) => {
          let searchValue = search;
          let objectPropertyValue = objElement[property];
          if (!!options) {
            if (!options.caseSentive) {
              searchValue = searchValue.toLowerCase();
              objectPropertyValue = objectPropertyValue.toLowerCase();
            }
          }

          return !!property && objectPropertyValue.includes(searchValue);
        })
      );
    });
  },
};
