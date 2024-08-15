const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, './');
const iconFiles = fs.readdirSync(iconsDir);

const iconArray = iconFiles
    .filter((item) => item !== 'index.js')
    .map((filePath) => ({
        group: filePath.replace(/\.(js|json)$/, ''),
        icons: require(path.join(iconsDir, filePath))
    }));

module.exports = iconArray;
