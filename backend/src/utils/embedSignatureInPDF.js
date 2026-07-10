const puppeteer = require('puppeteer');

/**
 * Generates a signature certificate page HTML and converts it to PDF buffer
 */
const generateSignaturePagePDF = async (data) => {
    const {
        contract_ref,
        signer_name,
        signer_designation,
        company_name,
        signed_at,
        ip_address,
        signature_image_url
    } = data;

    const signaturePageHTML = `
    <html>
    <body style="font-family: Georgia, serif; padding: 40px; color: #1e293b;">
        <div style="border: 2px solid #e2e8f0; padding: 40px; border-radius: 16px;">
            <h2 style="color: #1a1f2e; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 30px; font-size: 24px;">
                Digital Signature Certificate
            </h2>
            
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                This certifies that the Master Legal Package has been digitally signed by the authorized signatory on behalf of the client company. This signature is legally binding under the Information Technology Act, 2000.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <tr>
                    <td style="padding: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 13px;">Document Reference</td>
                    <td style="padding: 12px; font-weight: 700; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${contract_ref}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 13px;">Signed by</td>
                    <td style="padding: 12px; font-weight: 700; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${signer_name}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 13px;">Designation</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${signer_designation}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 13px;">Company</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${company_name}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 13px;">Date and Time</td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${new Date(signed_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                    <td style="padding: 12px; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 13px;">IP Address</td>
                    <td style="padding: 12px; font-family: monospace; border-bottom: 1px solid #f1f5f9; color: #1e293b;">${ip_address}</td>
                </tr>
            </table>
            
            <div style="margin-top: 40px;">
                <p style="color: #64748b; font-size: 12px; font-weight: 700; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Signature Evidence:</p>
                <div style="display: inline-block; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; background-color: #ffffff;">
                    <img src="${signature_image_url}" style="max-height: 80px; display: block;"/>
                </div>
            </div>
            
            <div style="margin-top: 50px; padding: 20px; background-color: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0;">
                <div style="font-size: 12px; color: #166534; font-weight: 600; line-height: 1.6;">
                    VERIFIED DIGITAL SIGNATURE: This digital signature is legally valid under the Information Technology Act, 2000 (India). 
                    The signatory confirmed agreement by checking the consent box and providing their digital signature through the ITjobx Secure Signing Platform.
                </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center;">
                <p style="font-size: 10px; color: #94a3b8; font-weight: 500;">
                    ITjobx Technologies Pvt Ltd · Secure Digital Signature Audit Trail · Document Ref: ${contract_ref}
                </p>
            </div>
        </div>
    </body>
    </html>`;

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
    });
    const page = await browser.newPage();
    await page.setContent(signaturePageHTML, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '40px',
            bottom: '40px',
            left: '40px',
            right: '40px'
        }
    });
    await browser.close();

    return pdfBuffer;
};

module.exports = generateSignaturePagePDF;
