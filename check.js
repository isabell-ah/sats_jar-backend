// Save this as checkAllRoutes.js in your backend directory

const fs = require('fs');
const path = require('path');

// Function to check a file for problematic patterns
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for URLs in route definitions
    const urlInRoutePattern =
      /(?:app|router)\.(?:use|get|post|put|delete|patch|options)\s*\(\s*['"]https?:\/\//g;
    let match;
    while ((match = urlInRoutePattern.exec(content)) !== null) {
      console.log(
        `ISSUE in ${filePath}: URL in route definition at position ${match.index}`
      );
      console.log(
        `  ${content.substring(match.index, match.index + 100).trim()}...`
      );
    }

    // Check for baseUrl in route definitions
    const baseUrlPattern =
      /(?:app|router)\.(?:use|get|post|put|delete|patch|options)\s*\(\s*(?:config\.)?baseUrl/g;
    while ((match = baseUrlPattern.exec(content)) !== null) {
      console.log(
        `ISSUE in ${filePath}: baseUrl in route definition at position ${match.index}`
      );
      console.log(
        `  ${content.substring(match.index, match.index + 100).trim()}...`
      );
    }

    // Check for route paths with colons not followed by a name
    const invalidParamPattern = /['"](?:[^'"]*?):(?!\w+)[^'"]*['"]/g;
    while ((match = invalidParamPattern.exec(content)) !== null) {
      console.log(
        `ISSUE in ${filePath}: Invalid route parameter at position ${match.index}`
      );
      console.log(`  ${match[0]}`);
    }

    // Check for ngrok URLs
    if (content.includes('ngrok-free.app')) {
      console.log(`ISSUE in ${filePath}: Contains ngrok URL`);
      // Find the line with ngrok
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('ngrok-free.app')) {
          console.log(`  Line ${i + 1}: ${lines[i].trim()}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`);
  }
}

// Scan a directory recursively
function scanDir(dir) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Skip node_modules and .git
        if (file !== 'node_modules' && file !== '.git') {
          scanDir(filePath);
        }
      } else if (file.endsWith('.js')) {
        checkFile(filePath);
      }
    });
  } catch (err) {
    console.error(`Error scanning directory ${dir}: ${err.message}`);
  }
}

// Start scanning from the current directory
console.log('Scanning for problematic route definitions...');
scanDir(__dirname);
console.log('Scan complete.');
