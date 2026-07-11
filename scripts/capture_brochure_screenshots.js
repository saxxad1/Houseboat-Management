const puppeteer = require('puppeteer-core');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3007';
const OUTPUT_DIR = './tmp/brochure_screenshots';

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  
  const capture = async (name, clip = null) => {
    // Wait 3 seconds to let charts/animations render and lazy images load
    await new Promise(r => setTimeout(r, 3000));
    
    await page.screenshot({ 
      path: `${OUTPUT_DIR}/${name}.jpg`, 
      type: 'jpeg', 
      quality: 95,
      fullPage: !clip,
      clip: clip
    });
    console.log(`Captured: ${name}`);
  };

  console.log('--- Frontend ---');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  
  // 1. Hero & Header
  await capture('1_hero', { x: 0, y: 0, width: 1440, height: 800 });
  
  // 2. Packages Section (scroll down)
  await page.evaluate(() => window.scrollBy(0, 850));
  await capture('2_packages', { x: 0, y: 850, width: 1440, height: 800 });
  
  // 3. Destinations/Gallery Section
  await page.evaluate(() => window.scrollBy(0, 1600));
  await capture('3_destinations', { x: 0, y: 2450, width: 1440, height: 800 });

  console.log('--- Admin Login ---');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
  await capture('4_admin_login', { x: 0, y: 0, width: 1440, height: 900 });
  
  console.log('--- Logging into Admin via Form ---');
  await page.type('#email', 'demoadmin@gmail.com');
  await page.type('#password', 'password');
  await page.click('button[type="submit"]');
  // Wait for the navigation to dashboard
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

  console.log('--- Admin Dashboard ---');
  await capture('5_admin_dashboard');

  console.log('--- Admin Bookings ---');
  await page.goto(`${BASE_URL}/admin/bookings`, { waitUntil: 'domcontentloaded' });
  await capture('6_admin_bookings');

  console.log('--- Admin Availability ---');
  await page.goto(`${BASE_URL}/admin/availability`, { waitUntil: 'domcontentloaded' });
  await capture('7_admin_availability');

  console.log('--- Admin Resource Settings ---');
  await page.goto(`${BASE_URL}/admin/season-settings`, { waitUntil: 'domcontentloaded' });
  await capture('8_admin_settings');

  await browser.close();
  console.log('Done capturing all screenshots!');
}

captureScreenshots().catch(console.error);
