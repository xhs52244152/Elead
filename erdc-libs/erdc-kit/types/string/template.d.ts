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
export default function template(source: string, options?: any): string;
