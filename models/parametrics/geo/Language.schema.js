const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    main_flag_2: { type: String },
    main_flag_3: { type: String },
    other_flags_2: [{ type: String }],
    other_flags_3: [{ type: String }],
    name: { type: String },
    native: { type: String },
    i18n: {
      type: Map,
      of: new mongoose.Schema(
        {
          name: String,
        },
        { _id: false }
      ),
    },
  },
  { timestamps: true }
);

module.exports = { schema };
