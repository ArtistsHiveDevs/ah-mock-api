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

  fillRelationship: function (
    mainObject,
    relationshipName,
    relationshipData,
    relationshipID = "id"
  ) {
    const mainObjectIsArray = Array.isArray(mainObject);
    let mainArray = mainObject;

    if (!mainObjectIsArray) {
      mainArray = [mainObject];
    }

    let relationshipDataArray = relationshipData;
    if (!Array.isArray(relationshipData)) {
      relationshipDataArray = [relationshipData];
    }

    mainArray.forEach((object) => {
      object[relationshipName.replace("_id", "")] = relationshipDataArray.find(
        (relatedObject) =>
          `${relatedObject[relationshipID]}` === `${object[relationshipName]}`
      );
    });

    return mainObjectIsArray ? mainArray : mainArray[0];
  },

  fillRelationships(originalData, relationships) {
    let fullData = originalData;

    relationships.forEach((relationship) => {
      fullData = this.fillRelationship(
        fullData,
        relationship.relationshipName,
        relationship.relationshipData,
        relationship.relationshipID || "id"
      );
    });

    return fullData;
  },

  attachRelationship(
    mainObject,
    objectRelationshipName,
    relationshipName,
    relationshipData,
    objectID = "id"
  ) {
    const mainObjectIsArray = Array.isArray(mainObject);
    let mainArray = mainObject;

    if (!mainObjectIsArray) {
      mainArray = [mainObject];
    }

    let relationshipDataArray = relationshipData;
    if (!Array.isArray(relationshipData)) {
      relationshipDataArray = [relationshipData];
    }
    console.log(relationshipName);

    mainArray.forEach((object) => {
      object[objectRelationshipName] = relationshipDataArray.filter(
        (relatedObject) =>
          `${relatedObject[relationshipName]}` === `${object[objectID]}`
      );
    });
    return mainObjectIsArray ? mainArray : mainArray[0];
  },

  attachRelationships(originalData, relationships, objectID = "id") {
    let fullData = originalData;

    relationships.forEach((relationship) => {
      fullData = this.attachRelationship(
        fullData,
        relationship.objectRelationshipName,
        relationship.relationshipName,
        relationship.relationshipData,
        objectID
      );
    });

    return fullData;
  },
};
