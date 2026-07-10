const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

const getEmailTemplate = (templateName, payload) => {
  const layouts = {
    job_submitted: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2563eb;">Job Submitted for Review</h2>
        <p>Dear Employer,</p>
        <p>Your job opportunity has been queued for auto-moderation and SLA processing. The typical turnaround is based on your service tier.</p>
        <p><strong>Status:</strong> Pending Review</p>
        <br/>
        <p>Best regards,<br/>ITjobx Recruiter Ops Team</p>
      </div>
    `,
    job_approved: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #16a34a;">Job Approved & Published!</h2>
        <p>Congratulations!</p>
        <p>Your job posting <strong>"${payload.jobTitle || 'Opportunity'}"</strong> has passed verification checks and is now live on our candidate portal.</p>
        <br/>
        <p>Best regards,<br/>ITjobx Recruiter Ops Team</p>
      </div>
    `,
    job_rejected: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #dc2626;">Job Status Update: Rejection</h2>
        <p>Dear Employer,</p>
        <p>Your job posting was reviewed by our trust and safety department and did not meet community posting guidelines.</p>
        <p><strong>Reason:</strong> ${payload.reason || 'Content Policy Violation'}</p>
        <p><strong>Note:</strong> ${payload.note || ''}</p>
        <p>Please edit the posting from your dashboard and resubmit to activate.</p>
        <br/>
        <p>Best regards,<br/>ITjobx Recruiter Ops Team</p>
      </div>
    `,
    job_auto_rejected: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #dc2626;">Automated Moderation Alert</h2>
        <p>Your job opportunity failed our automated content verification systems.</p>
        <p>Detected flags have been saved to your dashboard. Please adjust standard criteria (salary/spam terms) and resubmit.</p>
        <br/>
        <p>Best regards,<br/>ITjobx Recruiter Ops Team</p>
      </div>
    `,
    new_application: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h2 style="color: #2563eb;">New Job Application Received</h2>
        <p>Dear ${payload.companyName || 'Hiring Team'},</p>
        <p>A new candidate has applied for your job posting <strong>"${payload.jobTitle || 'Open Position'}"</strong>.</p>
        <p><strong>Candidate:</strong> ${payload.candidateName || 'Applicant'}</p>
        <p><strong>Applied On:</strong> ${payload.appliedAt || new Date().toLocaleDateString()}</p>
        <p>Log in to your ITjobx employer dashboard to review the application, download the resume, and update the status.</p>
        <br/>
        <p>Best regards,<br/>ITjobx Recruiter Ops Team</p>
      </div>
    `
  };

  return layouts[templateName] || `<p>ITjobx alert notification</p>`;
};

exports.sendEmail = async ({ to, template, payload }) => {
  try {
    const html = getEmailTemplate(template, payload);
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ITjobx Support" <noreply@ITjobx.in>',
      to,
      subject: `ITjobx Alert: ${template.replace(/_/g, ' ').toUpperCase()}`,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email dispatched successfully to ${to} for template ${template}`);
  } catch (error) {
    console.error(`SMTP Dispatch failed to ${to}:`, error.message);
  }
};
