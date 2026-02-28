const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

        await page.goto('file://C:/Users/MMB COM/Desktop/project/MYP/nextlevel/admin.html', { waitUntil: 'load' });

        console.log('Logging in...');
        await page.type('#admin-id', 'PROJECT-SHARKOLLE');
        await page.type('#admin-password', 'Amir@2015');
        await page.click('#login-btn');

        await new Promise(r => setTimeout(r, 1000));

        console.log('Testing Save Download URL...');
        await page.type('#download-url', 'https://github.com/Sharkolle/Next-level-fitness/releases/download/v1.0.0/NextLevel-Fitness.zip');
        await page.click('#save-download-btn');

        await new Promise(r => setTimeout(r, 2000));

        console.log('Testing Remove Download URL...');
        await page.click('#remove-download-btn');

        await new Promise(r => setTimeout(r, 2000));

        console.log('Done.');
        await browser.close();
    } catch (e) {
        console.error('Puppeteer Script Error:', e);
    }
})();
