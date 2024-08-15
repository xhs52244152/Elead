/**
 * 设置字段的值，支持深层设置。如果生成的对象需要是一个响应式, 则需要将组件示例传进来。
 * @param {Object} sourceObject
 * @param {String} field
 * @param {*} value
 * @param {Component} [_this]
 * @param {'_'|'.'} [concatenator='_']
 * @example
 *
 * const sourceObject = {};
 * const filed = 'aa_bb_cc';
 * const value = ['aa'];
 *
 * setFieldValue(sourceObject, field, value);
 * // => {
 * //      aa: {
 * //          bb: {
 * //              cc: ['aa']
 * //          }
 * //      }
 * //    }
 */
export default function setFieldValue(sourceObject, field, value, _this, concatenator = '_') {
    let formData = sourceObject;
    let fieldStr = field;
    let targetValue = value;
    let reg = new RegExp(concatenator, 'g');
    if (reg.test(fieldStr)) {
        const fieldArray = fieldStr.split(concatenator);
        _.reduce(
            fieldArray,
            (prev, key, index) => {
                if (index === fieldArray.length - 1) {
                    _this ? _this.$set(prev, key, targetValue) : (prev[key] = targetValue);
                } else if (!Object.keys(prev).includes(key)) {
                    _this ? _this.$set(prev, key, {}) : (prev[key] = {});
                }
                return prev[key];
            },
            formData
        );
    } else {
        _this ? _this.$set(formData, fieldStr, targetValue) : (formData[fieldStr] = targetValue);
    }
}
