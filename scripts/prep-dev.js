import fs from 'fs';

if (fs.existsSync('src/index.template.html')) {
  fs.copyFileSync('src/index.template.html', 'index.html');
  console.log('✔ index.html synchronized with /src/main.tsx');
}

