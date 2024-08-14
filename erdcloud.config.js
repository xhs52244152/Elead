const { defineConfig } = require('erdc-cli');

module.exports = defineConfig({
    build: {
        excludes: ['**/Gantt/libs/**'],
        optimize: {
            excludes: ['**/Gantt/**']
        }
    }
});
