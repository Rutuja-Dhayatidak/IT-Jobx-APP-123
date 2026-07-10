const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  description: { type: String },
  location: { type: String },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
