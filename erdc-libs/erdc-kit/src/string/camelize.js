/**
 * 字符串转小驼峰
 * @param {string} string
 * @returns {string}
 * @example
 * ```javascript
 * camelize('foo-bar'); // => fooBar
 * camelize('foo_bar'); // => fooBar
 * camelize('foo.bar'); // => fooBar
 * ```
 */
export default function camelize(string) {
    // reference to Lodash
    const asciiWords = string => (string.match(
        // eslint-disable-next-line no-control-regex
        /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g) || []);
    const upperFirst = string => string[0] ?
        string[0].toUpperCase() + string.substring(1) :
        '';
    const words = asciiWords(string.replace(/['\u2019]/g, ''));
    return words.reduce((result, word, index) => {
        word = index ?
            word.toLowerCase() :
            word.charAt(0).toLowerCase() + word.slice(1);
        return result + (index ? upperFirst(word) : word);
    }, '');
}
