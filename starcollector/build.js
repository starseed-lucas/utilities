const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Compile TypeScript
console.log('Compiling TypeScript...');
exec('tsc', (error, stdout, stderr) => {
  if (error) {
    console.error(`TypeScript compilation error: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`TypeScript stderr: ${stderr}`);
  }
  
  console.log('TypeScript compilation complete.');
  
  // Copy HTML and CSS files to dist
  console.log('Copying static files...');
  fs.copyFileSync('index.html', 'dist/index.html');
  fs.copyFileSync('styles.css', 'dist/styles.css');
  
  console.log('Build complete! Files are in the dist directory.');
});