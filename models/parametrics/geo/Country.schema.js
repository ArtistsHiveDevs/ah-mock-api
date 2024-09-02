const mongoose = require("mongoose");
const { Schema } = mongoose;

const countrySchema = new Schema({
  name: { type: String, required: true },
  native: { type: String, required: true },
  phone: { type: [Number], required: true },
  continent: { type: Schema.Types.ObjectId, ref: "Continent" },
  capital: { type: String },
  currency: [{ type: Schema.Types.ObjectId, ref: "Currency" }],
  languages: [{ type: Schema.Types.ObjectId, ref: "Languages" }],
  alpha2: { type: String },
  alpha3: { type: String },
  i18n: {
    type: Map,
    of: new mongoose.Schema(
      {
        name: String,
      },
      { _id: false }
    ),
  },
  official_name: { type: String, required: true },
  top_five_cities: { type: [String] },
  top_10_dishes: { type: [String] },
  top_10_non_alcoholic_beverages: { type: [String] },
  top_10_alcoholic_beverages: { type: [String] },
  top_10_touristic_activities: { type: [String] },
  official_languages: [{ type: String }],
});

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
