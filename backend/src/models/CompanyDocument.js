const mongoose = require("mongoose");

const companyDocumentSchema = new mongoose.Schema({
  company_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  document_type: { 
    type: String, 
    enum: ['gst_cert', 'pan_card', 'business_proof', 'company_proof'], 
    required: true 
  },
  document_url: { 
    type: String, 
    required: true 
  },
  uploaded_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate', 
    required: true 
  },
  verification_status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  uploaded_at: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model("CompanyDocument", companyDocumentSchema);
