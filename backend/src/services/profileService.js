const Profile = require("../models/Profile");
const Candidate = require("../models/Candidate");

const checkProfileCompletion = (profile, candidate) => {
  const missingFields = [];

  // 1. Skills
  const skills = profile ? profile.skills : [];
  if (!skills || skills.length === 0) missingFields.push("skills");

  // 2. Experience
  const exp = profile ? profile.experience : [];
  if (!exp || exp.length === 0) missingFields.push("experience");

  // 3. Preferred job role
  const prefRole = profile ? (profile.job_preferences?.role || profile.position || (profile.preferredRoles && profile.preferredRoles[0])) : "";
  if (!prefRole || prefRole.trim() === "") missingFields.push("preferredJobRole");

  // 4. Current location
  const loc = profile ? profile.location : "";
  if (!loc || loc.trim() === "") missingFields.push("location");

  // 5. Education
  const edu = profile ? profile.education : [];
  if (!edu || edu.length === 0) missingFields.push("education");

  // 6. Resume
  const resume = profile ? (profile.resumeUrl || profile.resumePublicId) : "";
  if (!resume || resume.trim() === "") missingFields.push("resume");

  const completedCount = 6 - missingFields.length;
  const profileCompletion = Math.round((completedCount / 6) * 100);

  return {
    isProfileComplete: missingFields.length === 0,
    missingFields,
    profileCompletion
  };
};

const calculateCompletion = (profile) => {
  return checkProfileCompletion(profile, null).profileCompletion;
};

const { generateSignedUrl } = require("./fileStorage.service");

const getProfileByUserId = async (userId) => {
  const profile = await Profile.findOne({ userId })
    .populate({
      path: "userId",
      select: "firstName lastName email phone company_id is_employer",
      populate: {
        path: "company_id",
        select: "status name verification_status rejectionReason official_work_email contact_person_name mobile_number company_location website_url about_company industry company_size gst_number cin_number pan_number logo"
      }
    });
  
  if (!profile) {
    const candidate = await Candidate.findById(userId)
      .select("firstName lastName email phone company_id is_employer")
      .populate("company_id", "status name verification_status rejectionReason official_work_email contact_person_name mobile_number company_location website_url about_company industry company_size gst_number cin_number pan_number logo");
    const completionInfo = checkProfileCompletion(null, candidate);
    return {
      profile: { userId: candidate, userType: "fresher", skills: [], education: [], experience: [], projects: [] },
      completionPercentage: completionInfo.profileCompletion,
      profileCompletion: completionInfo.profileCompletion,
      isProfileComplete: completionInfo.isProfileComplete,
      missingFields: completionInfo.missingFields
    };
  }

  // Generate temporary signed URL if resumePublicId exists
  if (profile.resumePublicId) {
    profile.resumeUrl = generateSignedUrl(profile.resumePublicId);
  }

  const completionInfo = checkProfileCompletion(profile, null);
  return {
    profile,
    completionPercentage: completionInfo.profileCompletion,
    profileCompletion: completionInfo.profileCompletion,
    isProfileComplete: completionInfo.isProfileComplete,
    missingFields: completionInfo.missingFields
  };
};

const updateProfile = async (userId, updateData) => {
  // Sanitize updateData to remove immutable and populated fields
  const cleanData = { ...updateData };
  delete cleanData._id;
  delete cleanData.userId;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;
  delete cleanData.__v;

  // Sync candidate level fields
  const candidateUpdates = {};
  const candidate = await Candidate.findById(userId);
  if (candidate) {
    if (updateData.firstName !== undefined && updateData.firstName !== candidate.firstName) {
      candidateUpdates.firstName = updateData.firstName;
    }
    if (updateData.lastName !== undefined && updateData.lastName !== candidate.lastName) {
      candidateUpdates.lastName = updateData.lastName;
    }
    if (updateData.phone !== undefined && updateData.phone !== candidate.phone) {
      candidateUpdates.phone = updateData.phone;
    }
    if (updateData.email !== undefined && updateData.email.toLowerCase() !== candidate.email.toLowerCase()) {
      const existingEmail = await Candidate.findOne({ 
        email: updateData.email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (existingEmail) {
        throw new Error("Email is already in use by another account");
      }
      candidateUpdates.email = updateData.email;
    }
    if (Object.keys(candidateUpdates).length > 0) {
      await Candidate.findByIdAndUpdate(userId, candidateUpdates);
    }
  }

  let profile = await Profile.findOne({ userId });

  // Automatically update userType to 'experienced' or 'fresher' based on experience records
  const hasExperience = (cleanData.experience !== undefined)
    ? (Array.isArray(cleanData.experience) && cleanData.experience.length > 0)
    : (profile && Array.isArray(profile.experience) && profile.experience.length > 0);
  
  cleanData.userType = hasExperience ? 'experienced' : 'fresher';

  if (profile) {
    profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: cleanData },
      { new: true, runValidators: true }
    );
  } else {
    profile = await Profile.create({ userId, ...cleanData });
  }

  const completionPercentage = calculateCompletion(profile);

  await Candidate.findByIdAndUpdate(userId, { 
    profileCompleted: completionPercentage >= 80 
  });

  return {
    profile,
    completionPercentage
  };
};

module.exports = {
  getProfileByUserId,
  updateProfile,
  calculateCompletion
};
