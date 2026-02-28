const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));
        page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url()));

        await page.goto('file://C:/Users/MMB COM/Desktop/project/MYP/nextlevel/admin.html', { waitUntil: 'load' });

        console.log('Page loaded. Typing credentials...');
        await page.type('#admin-id', 'PROJECT-SHARKOLLE');
        await page.type('#admin-password', 'Amir@2015');

        console.log('Clicking login...');
        await page.click('#login-btn');

        await new Promise(r => setTimeout(r, 2000));

        console.log('Done.');
        await browser.close();
    } catch (e) {
        console.error('Puppeteer Script Error:', e);
    }
})();
