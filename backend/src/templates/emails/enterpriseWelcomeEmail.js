/**
 * Enterprise Welcome Email Template
 */
const getEnterpriseWelcomeEmail = (data) => {
    const { hrName, companyName, activationDate, expiryDate, contractRef, amountPaid, managerName, managerEmail, managerPhone, managerInitials, dashboardUrl, contractUrl } = data;

    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a202c; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background-color: #1a1f2e; padding: 40px 20px; text-align: center; color: white; position: relative;">
            <div style="position: absolute; top: 20px; right: 20px; background: #2f855a; color: white; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; letter-spacing: 1px;">PLAN ACTIVE</div>
            <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">ITjobx ENTERPRISE</h1>
        </div>
        
        <div style="padding: 40px 30px;">
            <p style="font-size: 16px; color: #4a5568;">Hi ${hrName},</p>
            <h2 style="margin: 0; color: #1a202c; font-size: 24px;">Your ITjobx Enterprise plan is now active! 🎉</h2>
            <p style="color: #4a5568; margin-top: 8px;">We are thrilled to have <strong>${companyName}</strong> as our Enterprise client.</p>

            <!-- Plan Details -->
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid #edf2f7;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #718096;">Plan:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">Enterprise Annual</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #718096;">Active from:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${activationDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #718096;">Valid until:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${expiryDate}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #718096;">Contract ref:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${contractRef}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #718096;">Amount paid:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #2f855a;">${amountPaid}</td>
                    </tr>
                </table>
            </div>

            <!-- Account Manager Box -->
            <div style="border: 2px solid #ebf8ff; border-radius: 12px; padding: 25px; margin: 30px 0; background-color: #fff;">
                <h3 style="margin: 0 0 15px 0; font-size: 13px; text-transform: uppercase; color: #2b6cb0; letter-spacing: 1px;">YOUR ACCOUNT MANAGER</h3>
                <p style="margin: 5px 0; font-size: 15px;"><strong>Name:</strong> ${managerName}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong>Email:</strong> ${managerEmail}</p>
                <p style="margin: 5px 0; font-size: 15px;"><strong>Phone:</strong> ${managerPhone}</p>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #4a5568; font-style: italic;">"Will contact within 24 hours"</p>
            </div>

            <!-- Features Box -->
            <div style="background-color: #f0fff4; border: 1px solid #c6f6d5; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px 0; font-size: 13px; text-transform: uppercase; color: #2f855a; letter-spacing: 1px;">FEATURES NOW UNLOCKED</h3>
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px; font-size: 14px; color: #276749;">
                    <div>✅ Unlimited job posts</div>
                    <div>✅ Unlimited team members</div>
                    <div>✅ Advanced analytics</div>
                    <div>✅ Full API access</div>
                    <div>✅ Custom branding</div>
                    <div>✅ 24/7 Priority support</div>
                    <div>✅ SSO login integration</div>
                    <div>✅ Data migration support</div>
                    <div>✅ Dedicated account manager</div>
                </div>
            </div>

            <!-- Onboarding Timeline -->
            <div style="margin: 40px 0;">
                <h3 style="margin-bottom: 20px; font-size: 13px; color: #2d3748; text-transform: uppercase; letter-spacing: 1px;">YOUR 4-WEEK ONBOARDING</h3>
                
                <div style="border-left: 3px solid #e2e8f0; padding-left: 20px; margin-left: 10px;">
                    <div style="margin-bottom: 20px; position: relative;">
                        <div style="position: absolute; left: -26.5px; top: 0; width: 10px; height: 10px; background: #3182ce; border-radius: 50%;"></div>
                        <p style="margin: 0; font-weight: bold; font-size: 14px;">Week 1 — Account setup</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #718096;">Domain, branding, SSO, team accounts</p>
                    </div>
                    <div style="margin-bottom: 20px; position: relative;">
                        <div style="position: absolute; left: -26.5px; top: 0; width: 10px; height: 10px; background: #e2e8f0; border-radius: 50%;"></div>
                        <p style="margin: 0; font-weight: bold; font-size: 14px;">Week 2 — Data migration</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #718096;">Old ATS import, candidate data</p>
                    </div>
                    <div style="margin-bottom: 20px; position: relative;">
                        <div style="position: absolute; left: -26.5px; top: 0; width: 10px; height: 10px; background: #e2e8f0; border-radius: 50%;"></div>
                        <p style="margin: 0; font-weight: bold; font-size: 14px;">Week 3 — Team training</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #718096;">HR team, admin, interview panel</p>
                    </div>
                    <div style="position: relative;">
                        <div style="position: absolute; left: -26.5px; top: 0; width: 10px; height: 10px; background: #e2e8f0; border-radius: 50%;"></div>
                        <p style="margin: 0; font-weight: bold; font-size: 14px;">Week 4 — Go live! 🚀</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #718096;">Test, resolve, launch</p>
                    </div>
                </div>
            </div>

            <!-- Urgent Note -->
            <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #c05621;">
                    Your Account Manager <strong>${managerName}</strong> will contact you within 24 hours.<br>
                    Email: ${managerEmail} | Phone: ${managerPhone}
                </p>
            </div>

            <div style="text-align: center; margin: 40px 0; display: flex; gap: 10px; justify-content: center;">
                <a href="${dashboardUrl}" style="background-color: #2f855a; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Login to Dashboard →
                </a>
                <a href="${contractUrl}" style="background-color: white; color: #4a5568; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; border: 1px solid #e2e8f0;">
                    Download Contract
                </a>
            </div>
        </div>
        
        <div style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #edf2f7;">
            <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                ITjobx Technologies Pvt Ltd<br>
                Questions? Reply to this email.
            </p>
        </div>
    </div>
    `;
};

module.exports = { getEnterpriseWelcomeEmail };
