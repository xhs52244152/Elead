const { defineConfig } = require('erdc-cli');
const rjs = require('./rjs.config');

module.exports = defineConfig({
    collect: {
        includes: [
            {
                source: ['node_modules/**'],
                excludes: [],
                dest: 'erdc-libs/framework/node_modules'
            }
        ]
    },
    replaces: [],
    build: {
        excludes: [/node_modules/],
        optimize: {
            rjs
        }
    }
});
