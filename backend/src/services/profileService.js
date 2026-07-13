const Profile = require("../models/Profile");
const Candidate = require("../models/Candidate");

const calculateCompletion = (profile) => {
  const fields = [
    "profileImage", "headline", "location", "about", "skills", "resumeUrl"
  ];
  let filledCount = 0;

  fields.forEach(f => {
    if (Array.isArray(profile[f]) ? profile[f].length > 0 : (profile[f] && profile[f].toString().trim() !== "")) {
      filledCount++;
    }
  });

  if (profile.education?.length > 0) filledCount++;
  if (profile.experience?.length > 0 || profile.projects?.length > 0) filledCount++;

  const totalPossible = fields.length + 2;
  return Math.round((filledCount / totalPossible) * 100);
};

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
    return {
      profile: { userId: candidate, userType: "fresher", skills: [], education: [], experience: [], projects: [] },
      completionPercentage: 0
    };
  }

  return {
    profile,
    completionPercentage: calculateCompletion(profile)
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
