const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const albums = [
  { name: 'weird_al_yankovic', query: 'weird al yankovic 1983 album cover' },
  { name: 'in_3d', query: 'weird al in 3-d album cover' },
  { name: 'dare_to_be_stupid', query: 'weird al dare to be stupid album cover' },
  { name: 'polka_party', query: 'weird al polka party album cover' },
  { name: 'even_worse', query: 'weird al even worse album cover' },
  { name: 'uhf', query: 'weird al uhf soundtrack album cover' },
  { name: 'off_the_deep_end', query: 'weird al off the deep end album cover' },
  { name: 'alapalooza', query: 'weird al alapalooza album cover' },
  { name: 'bad_hair_day', query: 'weird al bad hair day album cover' },
  { name: 'running_with_scissors', query: 'weird al running with scissors album cover' },
  { name: 'poodle_hat', query: 'weird al poodle hat album cover' },
  { name: 'straight_outta_lynwood', query: 'weird al straight outta lynwood album cover' },
  { name: 'alpocalypse', query: 'weird al alpocalypse album cover' },
  { name: 'mandatory_fun', query: 'weird al mandatory fun album cover' },
];

const outputDir = path.join(__dirname, 'src/assets/album-covers');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  for (const album of albums) {
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(album.query)}&tbs=isz:l`;
    console.log(`Searching for: ${album.query}`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const imageUrl = await page.evaluate(() => {
      const img = document.querySelector('img[src^="https://"]');
      return img?.src || null;
    });

    if (!imageUrl) {
      console.warn(`No image found for ${album.name}`);
      continue;
    }

    const res = await fetch(imageUrl);
    const buffer = await res.buffer();
    const filePath = path.join(outputDir, `${album.name}.jpg`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved: ${filePath}`);
  }

  await browser.close();
})();
