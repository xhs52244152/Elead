const iconArray = require('./icons/index');

module.exports = iconArray.reduce((acc, { icons }) => {
    return [...acc, ...icons];
}, []);
