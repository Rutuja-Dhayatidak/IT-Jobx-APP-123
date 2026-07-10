const cloudinary = require("../config/cloudinary");
const { parseResume } = require("../utils/resumeParser");
const Profile = require("../models/Profile");
const streamifier = require("streamifier");

// Upload Resume and Parse
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Upload to Cloudinary (Raw for non-image files)
    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "resumes" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const cloudinaryRes = await uploadToCloudinary(req.file.buffer);
    const resumeUrl = cloudinaryRes.secure_url;

    // 2. Parse Resume Data
    const parsedData = await parseResume(req.file.buffer, req.file.originalname) || {
      headline: "",
      location: "",
      skills: []
    };

    // 3. Update Profile (Merge logic)
    const userId = req.user.id;
    let profile = await Profile.findOne({ userId });

    const newProfileData = {
      resumeUrl,
      userType: parsedData.userType || "fresher",
      fullName: parsedData.fullName || "",
      headline: parsedData.headline || "",
      location: parsedData.location || "",
      about: parsedData.about || "",
      skills: parsedData.skills || [],
      experience: parsedData.experience || [],
      education: parsedData.education || [],
      projects: parsedData.projects || [],
      certifications: parsedData.certifications || [],
      links: parsedData.links || { linkedin: "", github: "", portfolio: "" }
    };

    if (profile) {
      // Intelligent Merge: Only update if field is empty or array is empty
      if (!profile.resumeUrl) profile.resumeUrl = resumeUrl;
      if (!profile.headline) profile.headline = newProfileData.headline;
      if (!profile.location) profile.location = newProfileData.location;
      if (!profile.about) profile.about = newProfileData.about;
      profile.userType = newProfileData.userType;

      if (profile.skills.length === 0) profile.skills = newProfileData.skills;
      if (profile.experience.length === 0) profile.experience = newProfileData.experience;
      if (profile.education.length === 0) profile.education = newProfileData.education;
      if (profile.projects.length === 0) profile.projects = newProfileData.projects;

      await profile.save();
    } else {
      profile = await Profile.create({ userId, ...newProfileData });
    }

    res.json({
      success: true,
      resumeUrl,
      ...newProfileData // Spread all parsed data for frontend auto-fill
    });

  } catch (error) {
    console.error("UPLOAD CONTROLLER ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Internal Server Error during upload" 
    });
  }
};

// Simple file upload (already used for images)
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const uploadToCloudinary = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "uploads" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary(req.file.buffer);
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
