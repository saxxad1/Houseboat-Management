const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const HTML_FILE = 'file:///Users/pc/Documents/Houseboat%20Management/tmp/5page_brochure.html';
const OUTPUT_PDF = '/Users/pc/Downloads/Floatbase_Pitch_Deck.pdf';

async function generatePDF() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.goto(HTML_FILE, { waitUntil: 'networkidle0' });
  
  await page.pdf({
    path: OUTPUT_PDF,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  });

  await browser.close();
  console.log('5-Page PDF generated successfully!');
}

generatePDF().catch(console.error);
