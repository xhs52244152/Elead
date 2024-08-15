const path = require('path');
const createFontSlice = require('font-slice');

createFontSlice({
    // fontPath
    fontPath: path.resolve(__dirname, 'fonts/AlibabaPuHuiTi-3-55-Regular.ttf'),
    // outputDir
    outputDir: path.resolve(__dirname, './libs'),
    formats: ['ttf']
});
