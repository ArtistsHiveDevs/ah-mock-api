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

  findByDate: function (baseObject, dateProperty, date, comparison) {
    let baseArray = baseObject;
    const isArray = Array.isArray(baseObject);
    if (!isArray) {
      baseArray = [baseObject];
    }

    baseArray = baseArray.filter((object) => {
      let objectDate = object[dateProperty];
      if (objectDate) {
        objectDate = new Date(objectDate);
        const requestedDate = new Date(date);

        const difference = requestedDate.getTime() - objectDate.getTime();

        switch (comparison) {
          case "<=":
            return difference <= 0;
          case "<":
            return difference < 0;

          case ">=":
            return difference >= 0;
          case ">":
            return difference > 0;

          case "==":
            return difference == 0;

          default:
            break;
        }
      }
      return false;
    });
    return isArray ? baseArray : !!baseArray.length ? baseArray[0] : undefined;
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
      try {
        fullData = this.fillRelationship(
          fullData,
          relationship.relationshipName,
          relationship.relationshipData,
          relationship.relationshipID || "id"
        );
      } catch (error) {
        console.log(error);
      }
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

    mainArray.forEach((object) => {
      if (!objectRelationshipName.includes(".")) {
        object[objectRelationshipName] = relationshipDataArray.filter(
          (relatedObject) =>
            `${relatedObject[relationshipName]}` === `${object[objectID]}`
        );
      } else {
        const subpathnames = objectRelationshipName.split(".");

        object[subpathnames[0]].forEach((firstRelationship) => {
          if (relationshipName.includes("_id")) {
            this.fillRelationship(
              firstRelationship,
              relationshipName,
              relationshipDataArray
            );
          }
        });
      }
    });
    return mainObjectIsArray ? mainArray : mainArray[0];
  },

  attachRelationships(originalData, relationships, objectID = "id") {
    let fullData = originalData;

    relationships.forEach((relationship) => {
      fullData = this.attachRelationship(
        fullData,
        relationship.objectRelationshipName || relationship.field,
        relationship.relationshipName,
        relationship.relationshipData,
        objectID
      );
    });

    return fullData;
  },

  sortByDate(eventsArray, nameDate, nameHour) {
    return eventsArray.sort((event1, event2) => {
      const initialDate1 = event1[nameDate].split("-");
      var hour1 = event1[nameHour];
      var initialDatetime1 = new Date(
        initialDate1[0],
        initialDate1[1],
        initialDate1[2],
        `${hour1}`.substring(0, 2),
        `${hour1}`.substring(2, 4)
      );

      const initialDate2 = event2[nameDate].split("-");
      var hour2 = event2[nameHour];
      var initialDatetime2 = new Date(
        initialDate2[0],
        initialDate2[1],
        initialDate2[2],
        `${hour2}`.substring(0, 2),
        `${hour2}`.substring(2, 4)
      );

      const difference =
        initialDatetime1.getTime() - initialDatetime2.getTime();
      return difference;
    });
  },
};
