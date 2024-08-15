/**
 * 获取对象属性值，支持深层获取
 * @param {Object} sourceObject
 * @param {string} field
 * @param {Component} [_this]
 * @param {'_'|'.'} concatenator - 连接符
 * @returns {any}
 */
export default function getFieldValue(sourceObject, field, _this, concatenator = '_') {
    let formData = sourceObject;
    let fieldStr = field;
    let reg = new RegExp(concatenator, 'g');
    if (reg.test(fieldStr)) {
        const fieldArray = fieldStr.split(concatenator);
        return _.reduce(
            fieldArray,
            (prev, key, index) => {
                if (index === fieldArray.length - 1) {
                    // do nothing
                } else if (!Object.keys(prev).includes(key)) {
                    // this.$set(prev, key, {});
                    _this ? this.$set(prev, key, {}) : (prev[key] = {});
                }
                return prev[key];
            },
            formData
        );
    } else {
        return formData[fieldStr];
    }
}
