#!/usr/bin/env node
/**
 * download-images.js
 * 
 * Run this if imimg.com images don't load reliably on your deployed site.
 * It downloads all 55 product images from imimg.com and saves them locally
 * to public/products/, then rewrites products.js to use local paths.
 * 
 * USAGE:
 *   cd beyond-bliss-site
 *   node download-images.js
 * 
 * AFTER:  Re-deploy. Images now served from your domain, no hotlink risk.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const PRODUCTS_FILE = path.join(__dirname, 'public', 'products.js');
const OUT_DIR = path.join(__dirname, 'public', 'products');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Load PRODUCTS array
const productsCode = fs.readFileSync(PRODUCTS_FILE, 'utf8');
const fn = new Function(productsCode + '; return PRODUCTS;');
const products = fn();

console.log(`Downloading ${products.length} product images...\n`);

function download(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://m.indiamart.com/' } }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(filepath, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

(async () => {
  let ok = 0, fail = 0;
  const updated = [];
  
  for (const p of products) {
    const ext = p.image.match(/\.(jpe?g|png|webp)/i)?.[1] || 'jpg';
    const fname = `${p.slug}.${ext.toLowerCase()}`;
    const filepath = path.join(OUT_DIR, fname);
    const localPath = `/products/${fname}`;
    
    try {
      process.stdout.write(`  ${p.slug.padEnd(35)} ... `);
      await download(p.image, filepath);
      const size = fs.statSync(filepath).size;
      console.log(`✓ ${(size / 1024).toFixed(1)}KB`);
      ok++;
      updated.push({ ...p, image: localPath });
    } catch (e) {
      console.log(`✗ ${e.message} — keeping CDN URL`);
      fail++;
      updated.push(p); // keep original
    }
  }
  
  // Rewrite products.js with local paths
  const newJs = productsCode.replace(
    /const PRODUCTS = .*?;\n/s,
    `const PRODUCTS = ${JSON.stringify(updated, null, 2)};\n`
  );
  fs.writeFileSync(PRODUCTS_FILE, newJs);
  
  console.log(`\nDone: ${ok} downloaded, ${fail} failed.`);
  console.log(`products.js updated to use local paths.`);
  console.log(`Now redeploy your site.`);
})();
