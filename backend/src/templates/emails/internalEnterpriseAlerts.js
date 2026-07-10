/**
 * Internal Notification Templates (Account Manager & Sales Person)
 */

const getAccountManagerAssignmentEmail = (data) => {
    const { managerName, companyName, contactName, contactEmail, contactPhone, contractRef, amount, activationDate } = data;

    return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px;">
        <h2 style="color: #1e3a8a;">New Enterprise Client Assigned — ${companyName}</h2>
        <p>Hi ${managerName},</p>
        <p>You have been assigned as the <strong>Dedicated Account Manager</strong> for a new Enterprise client. Please initiate the onboarding process within 24 hours.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; font-size: 14px; color: #64748b; text-transform: uppercase;">CLIENT DETAILS</h3>
            <p style="margin: 5px 0;"><strong>Company:</strong> ${companyName}</p>
            <p style="margin: 5px 0;"><strong>Contact:</strong> ${contactName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${contactEmail}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${contactPhone}</p>
            <p style="margin: 5px 0;"><strong>Contract:</strong> ${contractRef}</p>
            <p style="margin: 5px 0;"><strong>Value:</strong> ${amount} / year</p>
        </div>

        <h3 style="color: #1e293b; font-size: 16px;">YOUR TASKS:</h3>
        <ol>
            <li>Contact client within 24 hours</li>
            <li>Schedule Week 1 onboarding call</li>
            <li>Complete 4-week onboarding plan</li>
            <li>Monthly check-in calls</li>
            <li>Handle renewal 30 days before expiry</li>
        </ol>

        <h3 style="color: #1e293b; font-size: 16px;">ONBOARDING SCHEDULE:</h3>
        <p style="font-size: 13px; color: #64748b;">
            Week 1: Account setup<br>
            Week 2: Data migration<br>
            Week 3: Team training<br>
            Week 4: Go live
        </p>

        <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background: #1e3a8a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View Client Details →</a>
        </div>
    </div>
    `;
};

const getSalesPersonNotificationEmail = (data) => {
    const { salesName, companyName, amount, contractRef } = data;
    const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; text-align: center;">
        <div style="font-size: 50px;">🏆</div>
        <h2 style="color: #059669;">🎉 Deal Won — ${companyName} Activated!</h2>
        <p>Congratulations ${salesName}!</p>
        <p><strong>${companyName}</strong> Enterprise plan is now active.</p>
        
        <div style="background: #ecfdf5; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #d1fae5; display: inline-block; min-width: 300px; text-align: left;">
            <p style="margin: 5px 0;"><strong>Deal value:</strong> ${amount}</p>
            <p style="margin: 5px 0;"><strong>Contract:</strong> ${contractRef}</p>
            <p style="margin: 5px 0;"><strong>Activated:</strong> ${date}</p>
        </div>

        <p style="margin-top: 20px; font-weight: bold; font-size: 16px; color: #065f46;">Great work closing this deal! 🏆</p>
        <p style="color: #64748b; font-size: 13px; margin-top: 40px;">ITjobx Technologies Pvt Ltd</p>
    </div>
    `;
};

module.exports = { getAccountManagerAssignmentEmail, getSalesPersonNotificationEmail };
