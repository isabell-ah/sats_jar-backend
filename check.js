// Save this as checkRoutes.js in your backend directory

const fs = require('fs');
const path = require('path');

// Directory to scan
const routesDir = path.join(__dirname, 'routes');

// Patterns that might indicate problematic URLs in route definitions
const problematicPatterns = [
  /app\.use\(['"]https?:\/\//,
  /router\.(?:get|post|put|delete|patch)\(['"]https?:\/\//,
  /app\.(?:get|post|put|delete|patch)\(['"]https?:\/\//,
  /path\s*:\s*['"]https?:\/\//,
  /['"]https?:\/\/[^'"]*['"]\s*,/,
];

// Function to check a file for problematic patterns
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  problematicPatterns.forEach((pattern) => {
    const match = content.match(pattern);
    if (match) {
      issues.push({
        pattern: match[0],
        line: content.substring(0, match.index).split('\n').length,
      });
    }
  });

  return issues;
}

// Scan all files in the routes directory
fs.readdirSync(routesDir).forEach((file) => {
  if (file.endsWith('.js')) {
    const filePath = path.join(routesDir, file);
    const issues = checkFile(filePath);

    if (issues.length > 0) {
      console.log(`Issues found in ${file}:`);
      issues.forEach((issue) => {
        console.log(`  Line ${issue.line}: ${issue.pattern}`);
      });
    }
  }
});

// Also check app.js
const appPath = path.join(__dirname, 'app.js');
if (fs.existsSync(appPath)) {
  const issues = checkFile(appPath);
  if (issues.length > 0) {
    console.log(`Issues found in app.js:`);
    issues.forEach((issue) => {
      console.log(`  Line ${issue.line}: ${issue.pattern}`);
    });
  }
}

console.log('Scan complete.');
