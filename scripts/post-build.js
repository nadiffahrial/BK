import fs from 'fs';
import path from 'path';

if (fs.existsSync('dist/index.html')) {
  fs.copyFileSync('dist/index.html', 'index.html');
  console.log('✔ Copied dist/index.html to root index.html for GitHub Pages');
}

if (fs.existsSync('dist/assets')) {
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets', { recursive: true });
  }
  const files = fs.readdirSync('dist/assets');
  files.forEach(f => {
    fs.copyFileSync(path.join('dist/assets', f), path.join('assets', f));
  });
  console.log(`✔ Copied ${files.length} production assets to /assets`);
}

