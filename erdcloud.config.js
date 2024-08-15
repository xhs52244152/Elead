const { defineConfig } = require('erdc-cli');

module.exports = defineConfig({
    build: {
        excludes: [/eleadCADView\/static/, /3DWebView\/appcadview/, /thirdparty\/2DView/, /thirdparty\/3DView/],
        optimize: {
            excludes: [/(erdc-pdm-mdb|erdc-pdm-icon|erdc-pdm-nds)/]
        }
    }
});
