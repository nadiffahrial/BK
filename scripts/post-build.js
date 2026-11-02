import fs from 'fs';
import path from 'path';

const distSource = fs.existsSync('frontend/dist') ? 'frontend/dist' : 'dist';

if (fs.existsSync(path.join(distSource, 'index.html'))) {
  fs.copyFileSync(path.join(distSource, 'index.html'), 'index.html');
  console.log('✔ Copied ' + distSource + '/index.html to root index.html');
}

// Copy to root dist as well for backward compatibility
if (distSource === 'frontend/dist') {
  if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true });
  fs.cpSync('frontend/dist', 'dist', { recursive: true });
  console.log('✔ Synced frontend/dist to root dist');
}

if (fs.existsSync(path.join(distSource, 'assets'))) {
  if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets', { recursive: true });
  }
  const files = fs.readdirSync(path.join(distSource, 'assets'));
  files.forEach(f => {
    fs.copyFileSync(path.join(distSource, 'assets', f), path.join('assets', f));
  });
  console.log(`✔ Copied ${files.length} production assets to /assets`);
}
