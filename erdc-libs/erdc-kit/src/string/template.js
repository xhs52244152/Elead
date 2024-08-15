const RE_NARGS = /(%|\$|)\{([0-9a-zA-Z_.]+)\}/g;

/**
 * 模板字符串解析
 * @param {string} source
 * @param {Object} options
 * @returns {string}
 * @example
 * ```js
 * template('你好，{name}', {name: '张三'}); // => '你好，张三'
 * template('你好，%{name}', {name: '张三'});// => '你好，张三'
 * template('你好，${name}', {name: '张三'});// => '你好，张三'
 * ```
 */
export default function template(source, options = {}) {
    return source.replace(RE_NARGS, (match, prefix, i, index) => {
        let result;

        if (source[index - 1] === '{' && source[index + match.length] === '}') {
            return i;
        } else {
            result = Object.hasOwn(options, i) ? options[i] : null;
            if (result === null || result === undefined) {
                return '';
            }
            return result;
        }
    });
}
