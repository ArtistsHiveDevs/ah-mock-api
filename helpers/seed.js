const createCRUDActions = require("./crud-actions");
const helpers = require("./helperFunctions");

async function seed({
  model,
  userId,
  forbiddenKeys = [],
  defaultValues = {},
  suffix = "",
  printEachNumberElements = 10,
  sleepTimeBetweenInstances = 100,
  relationships = [],
  extraInfoFunction = undefined,
}) {
  const modelActions = createCRUDActions({ model });
  const modelName = model.modelName;
  const data = helpers.getEntityData(modelName, false);

  let startTime = Date.now();
  let totalTime = 0;

  console.log(
    "   >  Seeding:  \n\t  ",
    modelName,
    "  (total: ",
    data.length,
    ")\n"
  );
  printEachNumberElements = Math.floor(
    (data.length * printEachNumberElements) / 100
  );

  if (extraInfoFunction) {
    extraInfoFunction(data);
  }

  const relationshipData = await Promise.all(
    relationships.map(async (relationship) => {
      const modelFields = [relationship.refField].join(",");
      const projection = (modelFields || fields || "")
        .split(",")
        .reduce((acc, field) => {
          acc[field] = 1;
          return acc;
        }, {});
      const relationshipData = await relationship.ref.find().select(projection); // Asegúrate de que .find() sea asíncrono
      return { name: relationship.ref.modelName, data: relationshipData };
    })
  );

  if (data.length > 0) {
    const allowedKeys = Object.keys(data[0]).filter(
      (key) => !forbiddenKeys.includes(key)
    );

    const errors = [];
    // console.log(">>> ", data);
    const seedData = helpers.hideProperties(data, allowedKeys);

    const defaultValuesIsArray = Array.isArray(defaultValues);
    const userIdIsArray = Array.isArray(userId);

    let setDefaultValues = defaultValues;

    let current = 0;

    // Procesar las instancias secuencialmente
    for (const [index, currentElement] of seedData.entries()) {
      try {
        if (defaultValuesIsArray) {
          setDefaultValues =
            defaultValues[Math.floor(Math.random() * defaultValues.length)];
        }
        let finalUserId = userId;
        if (userIdIsArray) {
          finalUserId = userId[Math.floor(Math.random() * userId.length)];
        }
        const instanceData = { ...currentElement, ...setDefaultValues };
        if (allowedKeys.includes("name")) {
          instanceData.name = `${instanceData.name}${suffix}`;
        }

        relationships.forEach((relationship) => {
          // instanceData[relationship.relationshipName] = relationshipData
          // console.log(
          //   Object.keys(relationshipData).find((relationshipKey) =>
          //     relationshipData[relationshipKey].data.find(
          //       (relObject) => relObject[relationship.relationshipName]
          //     )
          //   )
          // );
          const mockValue = instanceData[relationship.relationshipName];
          const isArray = Array.isArray(mockValue);
          let mockValues = mockValue;
          if (!isArray) {
            mockValues = [mockValue];
          }
          mockValues = mockValues.map((value) => {
            const relObjectData = relationshipData
              .find((entity) => entity.name === relationship.ref.modelName)
              .data.find((element) => element[relationship.refField] === value);
            if (!relObjectData) {
              console.log(
                `no se encontró "${relationship.ref.modelName}": ${value} en el ${modelName} ${instanceData["name"]}`
              );
            }
            return relObjectData?._id;
          });

          // if (modelName === "Country" && index === 4) {
          //   console.log(instanceData["name"], mockValues);
          // }
          if (!isArray) {
            mockValues = mockValues[0];
          }
          instanceData[
            relationship.newRelationshipName || relationship.relationshipName
          ] = mockValues;
        });

        // Por si se quiere evitar el registro en la DB
        if (true) {
          const re = await modelActions.createEntity({
            userId: finalUserId,
            body: instanceData,
          });

          // Si se desea realizar una pausa entre las operaciones, puedes usar `sleep`
          if ((index + 1) % printEachNumberElements === 0) {
            const currentTime = Date.now();
            const delta = currentTime - startTime;
            totalTime += delta;
            startTime = currentTime;

            console.log(
              "\t\t(",
              index + 1,
              " / ",
              data.length,
              ")    -     ",
              Math.round(((index + 1) * 100) / data.length),
              "%      ",
              `${helpers.convertMillis(delta)}      `,
              `${helpers.convertMillis(totalTime)}`
            );
          }
        }

        // Pausa entre instancias
        if (sleepTimeBetweenInstances) {
          await helpers.sleep(sleepTimeBetweenInstances);
        }

        current += 1;
      } catch (err) {
        console.log(err);
        errors.push(`${currentElement.id} ${currentElement.name}`);
        throw err;
      }
    }

    console.log(
      "\n          -  Seeding Finished:  ",
      modelName,
      "  (total: ",
      data.length,
      ` in ${helpers.convertMillis(totalTime)})\n`
    );
    // if (errors.length) {
    //   console.log("\n\nErrors: \n");
    //   console.error(JSON.stringify(errors, null, 4));
    // }
  }
}

module.exports = seed;
