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
  findByDistance: function (
    baseObject,
    searchLatLong,
    property,
    options = { maxdistance: 0.5 }
  ) {
    return baseObject?.filter((objElement) => {
      if (!!property) {
        const objLatLong = objElement[property];
        const coords = objLatLong.split(",");
        const latlong = {
          latitude: parseFloat(coords[0]),
          longitude: parseFloat(coords[1]),
        };

        return (
          latlong &&
          latlong.latitude >= searchLatLong.latitude - options.maxdistance &&
          latlong.latitude <= searchLatLong.latitude + options.maxdistance &&
          latlong.longitude >= searchLatLong.longitude - options.maxdistance &&
          latlong.longitude <= searchLatLong.longitude + options.maxdistance
        );
      } else {
        return objElement == search;
      }
    });
  },
};
