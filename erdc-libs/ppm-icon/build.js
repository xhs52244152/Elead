const { build } = require('@erdcloud/erdcloud-icon/build');
const path = require('path');
const fs = require('fs');

const resolve = (filePath) => path.resolve(__dirname, filePath);

const _outputPath = resolve('./lib');

if (fs.existsSync(_outputPath) && fs.readdirSync(_outputPath).length) {
    fs.rmSync(_outputPath, { recursive: true, force: true });
}

build({
    context: __dirname,
    resourcePath: resolve('./src/resource'),
    iconsFilePath: resolve('./src/icons.js'),
    mappingFilePath: resolve('./src/mapping.js'),
    outputPath: resolve('./lib')
})
    .then(() => {
        console.log(`erdc-ppm-icon build success`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
