/**
 * Payment Link Email Template
 */
const getPaymentLinkEmail = (data) => {
    const { companyName, amount, currency, link, contractRef, expiryDate, salesName, salesEmail, salesPhone } = data;

    // Formatting currency
    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);

    const baseAmount = amount / 1.18;
    const gstAmount = amount - baseAmount;

    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1a1f2e; padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">ITjobx Enterprise</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 16px;">Complete your plan activation</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; color: #2d3748;">Hi ${companyName},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                Your Enterprise contract has been successfully signed. Please complete the payment using the secure link below to activate your account and start your onboarding.
            </p>
            
            <div style="background-color: #f7fafc; border-radius: 8px; padding: 25px; margin: 30px 0; border: 1px solid #edf2f7;">
                <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #718096; letter-spacing: 1px;">Payment Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Contract Ref:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${contractRef}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Service:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">Enterprise Plan Annual</td>
                    </tr>
                    <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 12px 0; font-weight: bold; font-size: 18px; color: #1a202c;">Total Amount:</td>
                        <td style="padding: 12px 0; text-align: right; font-weight: 800; font-size: 20px; color: #2f855a;">${formattedAmount}</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="${link}" style="background-color: #2f855a; color: white; padding: 18px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Pay ${formattedAmount} Now →
                </a>
                <p style="margin-top: 15px; font-size: 12px; color: #a0aec0;">Secure payment powered by Razorpay</p>
            </div>
            
            <div style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #c05621;">
                    <strong>⚠️ Important:</strong> This payment link is valid for 7 days. Please complete the payment by <strong>${expiryDate}</strong> to avoid link expiration.
                </p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 14px; color: #718096;">Questions or assistance? Contact your Sales Representative:</p>
                <p style="margin: 5px 0; font-weight: bold; color: #2d3748;">${salesName}</p>
                <p style="margin: 0; font-size: 14px; color: #4a5568;">${salesEmail} | ${salesPhone}</p>
            </div>
        </div>
        
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
            © 2026 ITjobx Technologies Pvt Ltd. All rights reserved.
        </div>
    </div>
    `;
};

module.exports = { getPaymentLinkEmail };
