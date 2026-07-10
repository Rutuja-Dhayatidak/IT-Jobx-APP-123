/**
 * Payment Success Email Template
 */
const getPaymentSuccessEmail = (data) => {
    const { companyName, amount, paymentId, method, date, contractRef } = data;

    const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);

    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #16a34a; padding: 40px 20px; text-align: center; color: white;">
            <div style="font-size: 50px; margin-bottom: 15px;">✅</div>
            <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.5px;">Payment Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Welcome to ITjobx Enterprise</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <h2 style="margin-top: 0; color: #2d3748;">Thank you!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                We have successfully received your payment of <strong>${formattedAmount}</strong>. Your account is now being processed for activation.
            </p>
            
            <div style="background-color: #f0fff4; border-radius: 8px; padding: 25px; margin: 30px 0; border: 1px solid #c6f6d5;">
                <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #2f855a; letter-spacing: 1px;">Transaction Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Payment ID:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">${paymentId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Amount:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formattedAmount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Method:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; text-transform: capitalize;">${method}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Date:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #4a5568;">Reference:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${contractRef}</td>
                    </tr>
                </table>
            </div>
            
            <p style="font-size: 14px; color: #718096; text-align: center; margin-bottom: 30px;">
                Your GST Invoice is attached to this email for your records.
            </p>
            
            <div style="background-color: #ebf8ff; border: 1px solid #bee3f8; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h4 style="margin: 0 0 10px 0; color: #2b6cb0; text-transform: uppercase; font-size: 13px;">What happens next:</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #2c5282; line-height: 1.8;">
                    <li>Our team will activate your plan within 24 hours.</li>
                    <li>Your dedicated Account Manager will contact you shortly.</li>
                    <li>4-week personalized onboarding begins.</li>
                    <li>Platform fully live with your branding in 4 weeks.</li>
                </ul>
            </div>
        </div>
        
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
            © 2026 ITjobx Technologies Pvt Ltd. All rights reserved.
        </div>
    </div>
    `;
};

module.exports = { getPaymentSuccessEmail };
