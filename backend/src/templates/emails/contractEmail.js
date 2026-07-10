/**
 * Professional HTML Email Template for Contract Dispatch
 */
const contractEmailHTML = (data) => {
    const { client, contract, pdf_url } = data;

    return `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
    <div style="background-color: #1a1f2e; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px;">ITjobx ENTERPRISE</h1>
    </div>
    
    <div style="padding: 40px 30px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 24px;">Congratulations!</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hi <strong>${client.signatory_name}</strong>, we are thrilled to move forward with <strong>${client.company_name}</strong>.
        </p>
        
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Please find your <strong>Master Legal Package</strong> attached to this email. This comprehensive document contains:
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <ul style="margin: 0; padding-left: 20px; color: #1e293b; font-size: 14px;">
                <li style="margin-bottom: 8px;">Master Service Agreement (MSA)</li>
                <li style="margin-bottom: 8px;">Data Processing Addendum (DPA)</li>
                <li style="margin-bottom: 8px;">Service Level Agreement (SLA)</li>
                <li style="margin-bottom: 0;">Non-Disclosure Agreement (NDA)</li>
            </ul>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; font-size: 13px; color: #64748b; text-transform: uppercase;">Contract Summary</h3>
            <table style="width: 100%; font-size: 14px; color: #1e293b; border-collapse: collapse;">
                <tr>
                    <td style="padding: 5px 0; color: #64748b;">Ref Number:</td>
                    <td style="padding: 5px 0; text-align: right; font-weight: bold;">${contract.ref_number}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0; color: #64748b;">Contract Period:</td>
                    <td style="padding: 5px 0; text-align: right;">${contract.period_start} to ${contract.period_end}</td>
                </tr>
                <tr>
                    <td style="padding: 5px 0; color: #64748b;">Total Value:</td>
                    <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #059669;">₹${contract.total_amount.toLocaleString('en-IN')}</td>
                </tr>
            </table>
        </div>

        <!-- NEW: SIGN ONLINE BUTTON -->
        <div style="text-align: center; margin-bottom: 35px;">
            <a href="${data.sign_url}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">
                ✍️ Sign Contract Online
            </a>
            <p style="color: #64748b; font-size: 12px; margin-top: 10px;">Takes less than 2 minutes · Legally Binding</p>
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; font-size: 15px; color: #92400e;">Next Steps</h3>
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #92400e; line-height: 1.8;">
                <li>Review the attached Master Legal Package (PDF).</li>
                <li><strong>Click the button above to sign online (fastest)</strong> OR print, sign, scan and reply.</li>
                <li>We will trigger your platform activation within 24 hours of signing.</li>
            </ol>
        </div>

        <p style="color: #b91c1c; font-size: 13px; font-weight: bold;">Please sign within 7 days to proceed with onboarding.</p>
        
        <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #0f172a; font-weight: bold;">Gaurav Kumar</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Sales Director · ITjobx Enterprise</p>
        </div>
    </div>
    
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">ITjobx Technologies Pvt Ltd · Pune, Maharashtra, India</p>
    </div>
</div>
    `;
};

module.exports = { contractEmailHTML };
