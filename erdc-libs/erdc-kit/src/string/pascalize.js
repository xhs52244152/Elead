import camelize from './camelize';

/**
 * 字符串转大驼峰
 * @example
 * pascalize('foobar') // => Foobar
 * pascalize('foo-bar') // => FooBar
 *
 * @param {string} string
 * @returns {string}
 */
export default function(string) {
    if (!string) return string;
    const camelCase = camelize(string);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
