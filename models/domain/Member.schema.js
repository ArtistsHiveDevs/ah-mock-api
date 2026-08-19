const mongoose = require("mongoose");
const {schema: GenericKeyValueSchema} = require('./GenericKeyValue.schema');

const schema = new mongoose.Schema(
    {
        memberIdentifier: {
            type: String,
            required: true,
        },
        memberAttributes: {
            type: [GenericKeyValueSchema], 
            default: [] ,
            required: true,
        },
    },
    {timestamps: true}
);


module.exports = { schema };