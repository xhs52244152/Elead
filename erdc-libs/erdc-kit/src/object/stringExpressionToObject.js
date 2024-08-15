import uuid from '../uuid';
function evalFun(str) {
    return Function('"use strict";return (' + str + ')')();
}

/**
 * 将配置的json key-value类型的脚本字符串转换脚本
 * @param {string} data 待合并的对象，value为js
 * @param {window|Object} globalTarget 只能为window 或者window上的某个对象的全局对象,因为 eval 只能访问全局变量
 * @return {Object}
 * @example
 * ```javascript
 * let data = {"ELCONF.feat.defaultHeader": "function () {return {token: 'tokenStr'}}"};
 * console.log(stringExpressionToObject(data));
 * ```
 */
export default function (data, globalTarget) {
    let startStr,
        result = null;
    if (globalTarget) {
        startStr = globalTarget;
    } else {
        let uuidStr = uuid();
        startStr = 'window["' + uuidStr + '"]';
        window[uuidStr] = result = {};
    }
    _.each(data, function (val, key) {
        var keyArr = key.split('.'),
            length = keyArr.length - 1;
        _.reduce(
            keyArr,
            function (memo, item, index) {
                let key = memo + '["' + item + '"]';
                if (index === length) {
                    try {
                        evalFun(key + '=' + val);
                    } catch (e) {
                        val = '"' + val + '"';
                        evalFun(key + '=' + val);
                    }
                } else {
                    let keyIsExist = evalFun(key);
                    if (_.isUndefined(keyIsExist)) {
                        evalFun(key + '={}');
                    }
                }
                return key;
            },
            startStr
        );
    });
    uuid && delete window[uuid];
    return result;
}
