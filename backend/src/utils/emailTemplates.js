const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendInviteEmail = async (email, name, inviteLink, role) => {
  const mailOptions = {
    from: `"Job Portal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to Job Portal - You are invited as ${role}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
           <h1 style="color: #10b981; margin: 0;">NextHire</h1>
           <p style="color: #666; font-size: 14px; margin-top: 5px;">Admin Recruitment Platform</p>
        </div>
        <h2 style="color: #1a2e24; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Admin Invitation</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>You have been invited to join the <strong>NextHire Job Portal</strong> as a <span style="background-color: #f0fdf4; color: #10b981; padding: 4px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #10b981;">${role}</span>.</p>
        <p>Your account has been successfully created. Please click the button below to set your password and activate your administrative access:</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${inviteLink}" style="background-color: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Activate My Admin Account</a>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
           <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Role:</strong> ${role}</p>
           <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b;"><strong>Email:</strong> ${email}</p>
        </div>
        <p style="color: #ef4444; font-size: 12px; margin-top: 25px; font-weight: bold;">⚠️ This link will expire in 24 hours for security reasons.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 14px; color: #1a2e24;">Regards,<br><strong>NextHire Administrative Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
