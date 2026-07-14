const { uploadBufferToCloudinary, deleteFromCloudinary, generateSignedUrl } = require("../services/fileStorage.service");
const { calculateBufferChecksum } = require("../services/fileDelete.service");
const FileMetadata = require("../models/FileMetadata");
const Profile = require("../models/Profile");
const { parseResume } = require("../utils/resumeParser");
const { UploadErrorCodes } = require("../constants/upload.constants");

// Upload Resume (Authenticated/Private upload)
exports.uploadResume = async (req, res) => {
  let newCloudinaryRes = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: UploadErrorCodes.FILE_REQUIRED, message: "No file uploaded" }
      });
    }

    const userId = req.user.id;
    const checksum = calculateBufferChecksum(req.file.buffer);

    // 1. Check for duplicate upload (same user, same file content)
    const existingMetadata = await FileMetadata.findOne({ ownerId: userId, checksum, category: "resume" });
    if (existingMetadata) {
      // Generate short-lived signed URL for existing resume
      const signedUrl = generateSignedUrl(existingMetadata.publicId);
      
      return res.json({
        success: true,
        resumeUrl: signedUrl,
        message: "Duplicate file detected. Existing resume returned."
      });
    }

    // 2. Upload to Cloudinary under folder "resumes" as authenticated (private) resource
    try {
      newCloudinaryRes = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "resumes",
        public_id: req.file.filename.split(".")[0], // Strip extension for public_id
        resource_type: "raw", // Keep raw for PDF/DOCX
        type: "authenticated" // Private/Authenticated access only
      });
    } catch (uploadErr) {
      return res.status(500).json({
        success: false,
        error: {
          code: UploadErrorCodes.FILE_UPLOAD_FAILED,
          message: "Failed to upload resume to storage provider."
        }
      });
    }

    // 3. Parse resume contents
    const parsedData = await parseResume(req.file.buffer, req.file.originalname) || {
      headline: "",
      location: "",
      skills: []
    };

    // 4. Update Profile & replace old files
    let profile = await Profile.findOne({ userId });
    const oldPublicId = profile ? profile.resumePublicId : null;

    const secureUrl = newCloudinaryRes.secure_url;
    const publicId = newCloudinaryRes.public_id;

    const newProfileData = {
      resumeUrl: secureUrl,
      resumePublicId: publicId,
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
      // Merge values
      if (!profile.resumeUrl) profile.resumeUrl = secureUrl;
      profile.resumePublicId = publicId;
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

    // 5. Update/Save FileMetadata record
    await FileMetadata.findOneAndUpdate(
      { ownerId: userId, category: "resume" },
      {
        ownerType: "Candidate",
        storageProvider: "cloudinary",
        publicId,
        secureUrl,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        extension: req.file.filename.split(".").pop(),
        size: req.file.size,
        checksum,
        scanStatus: "CLEAN"
      },
      { upsert: true }
    );

    // 6. Delete old Cloudinary file now that new metadata is safely committed
    if (oldPublicId && oldPublicId !== publicId) {
      deleteFromCloudinary(oldPublicId, "raw").catch(() => {});
    }

    // Generate response signed URL
    const signedUrl = generateSignedUrl(publicId);

    res.json({
      success: true,
      resumeUrl: signedUrl,
      ...newProfileData
    });

  } catch (error) {
    // Transaction failure rollback: delete uploaded file if DB update crashed
    if (newCloudinaryRes && newCloudinaryRes.public_id) {
      deleteFromCloudinary(newCloudinaryRes.public_id, "raw").catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: {
        code: UploadErrorCodes.FILE_UPLOAD_FAILED,
        message: "Failed to process and save resume."
      }
    });
  }
};

// Simple profile image upload (Public upload)
exports.uploadFile = async (req, res) => {
  let newCloudinaryRes = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: UploadErrorCodes.FILE_REQUIRED, message: "No file uploaded" }
      });
    }

    const userId = req.user.id;
    const checksum = calculateBufferChecksum(req.file.buffer);

    // 1. Upload to Cloudinary under folder "profile_images"
    try {
      newCloudinaryRes = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "profile_images",
        public_id: req.file.filename.split(".")[0],
        resource_type: "image",
        type: "upload" // Publicly accessible image
      });
    } catch (uploadErr) {
      return res.status(500).json({
        success: false,
        error: {
          code: UploadErrorCodes.FILE_UPLOAD_FAILED,
          message: "Failed to upload image to storage provider."
        }
      });
    }

    const secureUrl = newCloudinaryRes.secure_url;
    const publicId = newCloudinaryRes.public_id;

    // 2. Update Profile reference
    let profile = await Profile.findOne({ userId });
    const oldPublicId = profile ? profile.profileImagePublicId : null;

    if (profile) {
      profile.profileImage = secureUrl;
      profile.profileImagePublicId = publicId;
      await profile.save();
    } else {
      profile = await Profile.create({
        userId,
        profileImage: secureUrl,
        profileImagePublicId: publicId
      });
    }

    // 3. Save metadata record
    await FileMetadata.findOneAndUpdate(
      { ownerId: userId, category: "profile-image" },
      {
        ownerType: "Candidate",
        storageProvider: "cloudinary",
        publicId,
        secureUrl,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        extension: req.file.filename.split(".").pop(),
        size: req.file.size,
        checksum,
        scanStatus: "CLEAN"
      },
      { upsert: true }
    );

    // 4. Delete old image
    if (oldPublicId && oldPublicId !== publicId) {
      deleteFromCloudinary(oldPublicId, "image").catch(() => {});
    }

    res.json({
      success: true,
      url: secureUrl
    });

  } catch (error) {
    if (newCloudinaryRes && newCloudinaryRes.public_id) {
      deleteFromCloudinary(newCloudinaryRes.public_id, "image").catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: {
        code: UploadErrorCodes.FILE_UPLOAD_FAILED,
        message: "Failed to process and save profile image."
      }
    });
  }
};
