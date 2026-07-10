const profileService = require("../services/profileService");

exports.getMe = async (req, res) => {
  try {
    const result = await profileService.getProfileByUserId(req.user.id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const result = await profileService.updateProfile(req.user.id, req.body);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
