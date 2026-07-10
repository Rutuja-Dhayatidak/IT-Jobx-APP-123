const bcrypt = require("bcryptjs");
const User = require("../models/Candidate");

const createSuperAdmin = async () => {
  try {
    // Check if admin exists by email OR phone to avoid duplicate key errors
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminPhone = process.env.SUPER_ADMIN_PHONE || "0000000000";

    const existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { phone: adminPhone }
      ]
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(
        process.env.SUPER_ADMIN_PASSWORD || "admin123",
        10
      );

      const adminName = process.env.SUPER_ADMIN_NAME || "Super Admin";
      const nameParts = adminName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Admin";

      await User.create({
        firstName: firstName,
        lastName: lastName,
        email: adminEmail,
        password: hashedPassword,
        phone: adminPhone,
        role: "super_admin",
        isVerified: true
      });

      console.log("✅ Super Admin Created");
    } else {
      console.log("⚡ Super Admin already exists (Matched by email or phone)");
    }
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  }
};

module.exports = createSuperAdmin;