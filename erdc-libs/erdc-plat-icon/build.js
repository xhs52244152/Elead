const { build } = require('@erdcloud/erdcloud-icon/build');
const path = require('path');
const fs = require('fs');

const resolve = (filePath) => path.resolve(__dirname, filePath);

const _outputPath = resolve('./lib');

if (fs.existsSync(_outputPath) && fs.readdirSync(_outputPath).length) {
    fs.rmSync(_outputPath, { recursive: true, force: true });
}

const iconArray = require('./src/icons/index.js');

const iconMap = iconArray.reduce((acc, { icons, group }) => {
    icons.forEach((icon) => {
        acc[icon] = group;
    });
    return acc;
}, {});

const outputPath = resolve(`./lib`);
build({
    context: __dirname,
    resourcePath: resolve(`./src/resource`),
    iconsFilePath: resolve(`./src/icons.js`),
    mappingFilePath: resolve(`./src/mapping.js`),
    outputPath
})
    .then(() => {
        const outputJsonPath = path.join(outputPath, 'erd-iconfont.json');
        const outputJson = require(outputJsonPath);
        const icons = outputJson.glyphs || [];
        icons.forEach((icon) => {
            if (iconMap[icon.font_class]) {
                icon.group = iconMap[icon.font_class];
            }
        });
        outputJson.glyphs = icons;
        fs.writeFileSync(outputJsonPath, JSON.stringify(outputJson, null, 2));
    })
    .then(() => {
        console.log('build success');
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
