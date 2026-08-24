const { generateSID } = require("./sID");

function sIDPlugin(schema) {
  schema.add({ sID: { type: String } });
  schema.index({ sID: 1 }, { unique: true, sparse: true });

  schema.pre("validate", function () {
    if (!this.sID) {
      this.sID = generateSID();
    }
  });
}

module.exports = { sIDPlugin };
