const puppeteer = require('puppeteer');
const cloudinary = require('../config/cloudinary');
const { generateLegalHTML } = require('../templates/legalPackage');

/**
 * Generates a PDF using Puppeteer and uploads it to Cloudinary
 */
const generateContractPDF = async (data) => {
    let browser;
    try {
        const html = generateLegalHTML(data);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            },
            printBackground: true,
            displayHeaderFooter: false
        });

        console.log(`PDF Generated. Buffer size: ${pdfBuffer.length} bytes`);

        const filename = `ITjobx-Contract-${data.contract.ref_number.replace(/\//g, '-')}-${Date.now()}`;

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'ITjobx/contracts',
                    public_id: filename,
                    type: 'upload',
                    access_mode: 'public'
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        reject(error);
                    } else {
                        console.log("Cloudinary Upload Success:", result.secure_url);
                        resolve(result);
                    }
                }
            );
            stream.end(pdfBuffer);
        });

        return {
            pdf_url: uploadResult.secure_url,
            pdf_buffer: pdfBuffer, // Return buffer for direct email attachment
            filename: `${filename}.pdf`,
            generated_at: new Date()
        };

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = generateContractPDF;
