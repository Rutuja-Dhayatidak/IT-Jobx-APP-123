const { PDFDocument } = require('pdf-lib');
const axios = require('axios');
const cloudinary = require('../config/cloudinary');

/**
 * Merges the original contract PDF with the signature certificate page
 * @param {string} originalPdfUrl - URL of the original contract PDF
 * @param {Buffer} signaturePageBuffer - Buffer of the generated signature page PDF
 * @param {string} signatureBase64 - Base64 string of the signature image
 * @returns {Promise<Buffer>} - Merged PDF buffer
 */
const mergePDFs = async (originalPdfUrl, signaturePageBuffer, signatureBase64) => {
    try {
        console.log(`Attempting to fetch original PDF from: ${originalPdfUrl}`);
        
        // 1. Generate a signed URL or get authoritative URL from API
        let fetchUrl = originalPdfUrl;
        try {
            const urlParts = originalPdfUrl.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex !== -1) {
                // Extract public ID
                let publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
                if (!urlParts[uploadIndex + 1].startsWith('v')) {
                     publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
                }
                const resourceType = urlParts[uploadIndex - 1] || 'image';
                
                // For 'image' resource_type, Cloudinary public_id DOES NOT include the extension
                // For 'raw' resource_type, Cloudinary public_id MUST include the extension
                const publicId = resourceType === 'raw' ? publicIdWithExt : publicIdWithExt.split('.').slice(0, -1).join('.');

                console.log(`Generating private download URL for: ${publicId} (${resourceType})`);
                
                fetchUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
                    resource_type: resourceType,
                    type: 'upload',
                    cloud_name: process.env.CLOUD_NAME,
                    api_key: process.env.API_KEY,
                    api_secret: process.env.API_SECRET
                });
                
                console.log(`Generated Private Download URL.`);
            }
        } catch (urlErr) {
            console.error("Cloudinary Private Download URL generation failed:", urlErr);
            fetchUrl = originalPdfUrl;
        }

        // 2. Fetch original PDF bytes
        console.log(`Executing axios fetch to: ${fetchUrl}`);
        const response = await axios.get(fetchUrl, { 
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const originalBytes = response.data;

        // Validation: Check if it's actually a PDF
        const header = originalBytes.slice(0, 4).toString();
        if (header !== '%PDF') {
            const errorMsg = originalBytes.toString('utf8').slice(0, 200);
            console.error("Cloudinary did not return a PDF. Response:", errorMsg);
            throw new Error(`Cloudinary returned an invalid response instead of a PDF. Please check API credentials and asset permissions. Details: ${errorMsg}`);
        }

        // 3. Load documents
        const originalPdf = await PDFDocument.load(originalBytes);
        const sigPdf = await PDFDocument.load(signaturePageBuffer);

        // 4. Draw signature on the last page of original PDF (Directly on the line)
        const pages = originalPdf.getPages();
        const lastPage = pages[pages.length - 1];
        
        if (signatureBase64) {
            try {
                // Clean base64 string
                const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
                const imageBuffer = Buffer.from(base64Data, 'base64');
                
                let sigImage;
                if (signatureBase64.includes('image/png')) {
                    sigImage = await originalPdf.embedPng(imageBuffer);
                } else {
                    sigImage = await originalPdf.embedJpg(imageBuffer);
                }

                // Draw image on the CLIENT signature line
                // Coordinates based on the legalPackage template layout
                // A4 is roughly 595 x 842 points
                lastPage.drawImage(sigImage, {
                    x: 60,
                    y: 165,
                    width: 150,
                    height: 45,
                });
                console.log("Signature drawn on the last page of original PDF.");
            } catch (drawErr) {
                console.error("Failed to draw signature on original PDF:", drawErr);
            }
        }

        // 5. Add Certificate Page
        const [sigPage] = await originalPdf.copyPages(sigPdf, [0]);
        originalPdf.addPage(sigPage);

        // 6. Save merged PDF
        const mergedPdfBytes = await originalPdf.save();
        return Buffer.from(mergedPdfBytes);
    } catch (error) {
        console.error("Error merging PDFs:", error);
        throw new Error(`Failed to merge signature with contract PDF: ${error.message}`);
    }
};

module.exports = mergePDFs;
