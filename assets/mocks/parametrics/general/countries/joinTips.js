console.log("HELLO");

const fs = require("fs");

const fullCountryObjs = JSON.parse(fs.readFileSync(`./fullCountries.json`));

const countrysTipsObjs = JSON.parse(fs.readFileSync(`./countriesTips.json`));

let amount = 0;
let str = "";

let newList = [];
let b = false;
Object.keys(fullCountryObjs).forEach((fullCountryKey) => {
  let fullCountry = fullCountryObjs[fullCountryKey];
  const tips = countrysTipsObjs.find(
    (tip) =>
      tip?.common_name?.toLowerCase() === fullCountry?.name?.toLowerCase() ||
      tip?.ISO?.toLowerCase() === fullCountry?.alpha3?.toLowerCase()
  );

  if (tips) {
    const allowed = [
      "official_name",
      "top_five_cities",
      "top_10_dishes",
      "top_10_non_alcoholic_beverages",
      "top_10_alcoholic_beverages",
      "top_10_touristic_activities",
      "official_languages",
      "languages_people_understand",
    ];

    const filtered = Object.keys(tips)
      .filter((key) => allowed.includes(key))
      .reduce((obj, key) => {
        obj[key.toLowerCase()] = tips[key];
        return obj;
      }, {});

    if (b) {
      console.log("================================================");
      console.log(fullCountry, tips, filtered);
    }
    fullCountry = { ...fullCountry, ...filtered };
    if (b) {
      console.log("    XXXXX ", fullCountry);
      b = false;
    }
    newList.push(fullCountry);
  } else {
    if (amount < 10) {
      str += ", " + fullCountry.name;
      amount++;
    } else {
      console.log(str);
      amount = 0;
      str = "";
    }
  }
});

// console.log(newList[3]);

fs.writeFileSync("./fullCountriesTips.json", JSON.stringify(newList));
console.log("BYE");
