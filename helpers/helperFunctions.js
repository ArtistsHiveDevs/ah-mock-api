const userRoleMapFields = [
  "id",
  "profile_pic",
  "name",
  "username",
  "subtitle",
  "verified_status",
  "roles",
];
module.exports = {
  sleep: function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  convertMillis: function (milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds} ms`;
    }

    const seconds = (milliseconds / 1000).toFixed(2);
    if (seconds < 60) {
      return `${seconds} s`;
    }

    const minutes = (seconds / 60).toFixed(2);
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = (minutes / 60).toFixed(2);
    return `${hours} hr`;
  },
  removeStringAccents: function (str) {
    return str.replace(/[^A-Za-z0-9\[\] ]/g, function (a) {
      const { StringAccentsMap } = require("./stringAccentsMap");
      return StringAccentsMap[a] || a;
    });
  },
  normalizeString: function (str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Eliminar diacríticos
  },
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
          const propertyPath = property.split(".") || [];
          let searchValue = search;
          let objectPropertyValue =
            propertyPath.reduce((previous, current) => {
              return previous ? previous[current] : "";
            }, objElement) || "";

          if (!!options) {
            if (!options.caseSentive) {
              searchValue = this.removeStringAccents(
                searchValue.toLowerCase().trim()
              );
              console.log(
                "TYPEE!!!!!  ",
                typeof objectPropertyValue,
                JSON.stringify(objectPropertyValue, null, 2)
              );
              objectPropertyValue = !!objectPropertyValue
                ? this.removeStringAccents(
                    objectPropertyValue.toLowerCase().trim()
                  )
                : "";
            }
          }

          return (
            !!property &&
            searchValue &&
            objectPropertyValue &&
            objectPropertyValue.includes(searchValue)
          );
        })
      );
    });
  },

  findByDistance: function (
    baseObject,
    searchLatLong,
    property,
    options = { maxdistance: 5 } // Measured in Km
  ) {
    return baseObject?.filter((objElement) => {
      if (!!property) {
        const propertyPath = property.split(".") || [];
        const objLatLong = propertyPath.reduce(
          (previous, current) => previous[current],
          objElement
        );

        const coords = objLatLong.split(",");
        const latlong = {
          latitude: parseFloat(coords[0]),
          longitude: parseFloat(coords[1]),
        };

        // 1° @Equator = 110.567 / 1° @Poles = 110.699 / 1° Avg  = 111.133
        const degreeKmRate = (110.567 + 110.699) / 2;

        const maxDistanceInDegrees = options.maxdistance / degreeKmRate;

        return (
          latlong &&
          latlong.latitude >= searchLatLong.latitude - maxDistanceInDegrees &&
          latlong.latitude <= searchLatLong.latitude + maxDistanceInDegrees &&
          latlong.longitude >= searchLatLong.longitude - maxDistanceInDegrees &&
          latlong.longitude <= searchLatLong.longitude + maxDistanceInDegrees
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

  getEntityData(entityName, randomize = true) {
    let response = [];
    const fs = require("fs");

    const artists = JSON.parse(
      fs.readFileSync(
        `C:/Users/fnp/Documents/Proyectos/QuarenDevs/2024/tsProcessor/data/drive/artists_drive_db_output.json`
      )
      // fs.readFileSync(`./assets/mocks/domain/artists/artistsList.json`)
    );
    const albums = JSON.parse(
      fs.readFileSync(`./assets/mocks/domain/artists/albumsList.json`)
    );
    const allergies = JSON.parse(
      fs.readFileSync(`./assets/mocks/parametrics/demographics/allergies.json`)
    );
    const continents = JSON.parse(
      fs.readFileSync(
        `./assets/mocks/parametrics/general/continents/continentsDB.json`
      )
    );
    const countries = JSON.parse(
      fs.readFileSync(
        `./assets/mocks/parametrics/general/countries/fullCountriesTips.json`
      )
    );
    const currencies = JSON.parse(
      fs.readFileSync(
        `./assets/mocks/parametrics/general/currencies/currencies.json`
      )
    );
    const events = JSON.parse(
      fs.readFileSync(`./assets/mocks/domain/events/eventsList.json`)
    );
    const instruments = JSON.parse(
      fs.readFileSync(
        `./assets/mocks/parametrics/domain/instruments/instrumentsList.json`
      )
    );
    const languages = JSON.parse(
      fs.readFileSync(
        `./assets/mocks/parametrics/general/languages/languages_full.json`
      )
    );
    const places = JSON.parse(
      fs.readFileSync(`./assets/mocks/domain/places/placesList.json`)
    );
    const rehearsalRooms = JSON.parse(
      fs.readFileSync(
        `./assets/mocks/domain/rehearsal_rooms/rehearsal_roomsList.json`
      )
    );
    const users = JSON.parse(
      fs.readFileSync(`./assets/mocks/domain/users/usersList.json`)
    );
    const riders = JSON.parse(
      fs.readFileSync(`./assets/mocks/domain/riders/ridersList.json`)
    );
    const academies = JSON.parse(
      fs.readFileSync(`./assets/mocks/domain/academies/academiesList.json`)
    );

    if (entityName === "Artist") {
      response = [...artists];
    } else if (entityName === "Album") {
      response = [...albums];
    } else if (entityName === "Allergy") {
      response = [...allergies];
    } else if (entityName === "Continent") {
      response = [...continents];
    } else if (entityName === "Country") {
      response = [...countries];
    } else if (entityName === "Currency") {
      response = [...currencies];
    } else if (entityName === "Event") {
      response = [...events];

      const one_day = 1000 * 60 * 60 * 24;
      const firstEventDate = new Date("2022-12-06");
      const today = new Date();
      const DAYS_DIFERENCE =
        Math.round((today - firstEventDate) / one_day) - 50;

      const fechas = ["timetable__initial_date", "timetable__end_date"];

      const EVENT_CONFIRMATION_STATUS = {
        DRAFT: "DRAFT",
        CREATED: "CREATED",
        UNDER_REVIEW: "UNDER_REVIEW",
        RETURNED: "RETURNED",
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        CANCELLED: "CANCELLED",
      };

      response.forEach((event) => {
        fechas.forEach((fecha) => {
          const eventOriginalDate = new Date(event[fecha]);

          const eventUpdatedDate = new Date(eventOriginalDate);
          eventUpdatedDate.setDate(
            eventOriginalDate.getDate() + DAYS_DIFERENCE
          );
          const year = eventUpdatedDate.getFullYear();
          const month = String(eventUpdatedDate.getMonth() + 1).padStart(
            2,
            "0"
          );
          const day = String(eventUpdatedDate.getDate()).padStart(2, "0");

          event[fecha] = `${year}-${month}-${day}`;
        });

        event["confirmation_status"] = Object.keys(EVENT_CONFIRMATION_STATUS)[
          Math.floor(
            Math.random() * Object.keys(EVENT_CONFIRMATION_STATUS).length
          )
        ];
      });
    } else if (entityName === "Instrument") {
      response = [...instruments];
    } else if (entityName === "Language") {
      response = [...languages];
    } else if (entityName === "Place") {
      response = [...places];
    } else if (entityName === "User") {
      response = [...users];
    } else if (entityName === "Rider") {
      response = [...riders];
    } else if (entityName === "Academy") {
      response = [...academies];
    } else if (entityName === "RehearsalRoom") {
      response = [...rehearsalRooms];
    }
    if (randomize) {
      this.shuffle(response);
    }
    return response;
  },
  paginate(array, current_page = 1, page_size = 5) {
    const initialIndex = (current_page - 1) * page_size;
    return array.slice(initialIndex, initialIndex + page_size);
  },
  shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  },
  hideProperties(arrayObjects, properties) {
    return arrayObjects.map((element) =>
      properties.reduce((acc, prop) => {
        if (element.hasOwnProperty(prop)) {
          acc[prop] = element[prop];
        }
        return acc;
      }, {})
    );
  },
  userRoleMapFields,
  hasToUpdateUserRoleMap(updateInfo) {
    return Object.keys(updateInfo).some((updateKey) =>
      userRoleMapFields.includes(updateKey)
    );
  },
  flattenObject(obj, parentPath = "") {
    const updateFields = {};
    for (const key in obj) {
      const path = parentPath ? `${parentPath}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        !Array.isArray(obj[key]) &&
        obj[key] !== null
      ) {
        // Verifica si el objeto intermedio existe y si no, lo crea
        if (!updateFields[path]) {
          updateFields[path] = {};
        }
        this.flattenObject(obj[key], path);
      } else {
        updateFields[path] = obj[key];
      }
    }
    return updateFields;
  },
};
