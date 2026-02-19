const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const readmeJaPath = path.join(__dirname, '..', 'README_JA.md');
const readmeEnPath = path.join(__dirname, '..', 'README_EN.md');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

function updateReadme(filePath, version) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace PalGuard_vX.X.X.zip
    content = content.replace(/PalGuard_v\d+\.\d+\.\d+\.zip/g, `PalGuard_v${version}.zip`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated version in ${path.basename(filePath)} to v${version}`);
}

updateReadme(readmeJaPath, version);
updateReadme(readmeEnPath, version);
