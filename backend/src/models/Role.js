const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  actions: [{ type: String }]
}, { _id: false });

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    permissions: [permissionSchema],
    description: {
      type: String
    }
  },
  { 
    timestamps: true,
    collection: 'roles'
  }
);

module.exports = mongoose.model("Role", roleSchema);
