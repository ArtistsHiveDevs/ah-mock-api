const createCRUDActions = require("./crud-actions");
const helpers = require("./helperFunctions");

async function seed({
  model,
  modelName,
  userId,
  forbiddenKeys,
  defaultValues = {},
  suffix = "",
  printEachNumberElements = 30,
  sleepTimeBetweenInstances = 100,
}) {
  const modelActions = createCRUDActions(model, modelName);
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

  if (data.length > 0) {
    const allowedKeys = Object.keys(data[0]).filter(
      (key) => !forbiddenKeys.includes(key)
    );

    const errors = [];
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
        await modelActions.createEntity({
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
