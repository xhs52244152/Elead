/**
 * 驼峰转转横线拆分字符
 * @example
 * hyphenate('fooBar'); // 'foo-bar'
 * hyphenate('FooBar'); // 'foo-bar'
 * hyphenate('foo-bar'); // 'foo-bar'
 * hyphenate('FOOBAR'); // 'f-o-o-b-a-r'
 * @param {string} string
 * @returns {string}
 */
export default function hyphenate(string) {
    if (!string) return string;
    return string.replace(/\B([A-Z])/g, '-$1').toLowerCase();
}
