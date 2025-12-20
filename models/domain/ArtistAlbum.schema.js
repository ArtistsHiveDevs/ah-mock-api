const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    // Album Id
    aId: {
      type: String,
    },
    // Name
    n: {
      type: String,
    },
    // Artists Spotify Ids
    asp: [
      {
        type: String,
      },
    ],
    // Images
    img: [{ type: mongoose.Schema.Types.Mixed }],
    // Release Date
    rd: {
      type: String,
    },
    // Release Date precision
    rdp: {
      type: String,
    },
    // Images
    t: [{ type: mongoose.Schema.Types.Mixed }],
    // Track Number
    nt: { type: Number },
    // Label
    lab: {
      type: String,
    },
    // Search Index
    idx: {
      type: String,
    },
    c: String,
  },
  { timestamps: true }
);

schema.index({ idx: 1 });
schema.index({ aId: 1 });

module.exports = { schema };
