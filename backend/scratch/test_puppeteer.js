const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log("Launching puppeteer...");
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: 'new'
        });
        console.log("Browser launched.");
        const page = await browser.newPage();
        await page.setContent('<h1>Test</h1>');
        const pdf = await page.pdf({ format: 'A4' });
        console.log("PDF generated, size:", pdf.length);
        await browser.close();
        console.log("Success!");
    } catch (err) {
        console.error("Puppeteer Test Failed:", err);
    }
})();
