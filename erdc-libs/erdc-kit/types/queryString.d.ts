/**
 * 解析参数
 * @example
 * FamKit.getParams('foo=bar&flag=1');
 * // =>
 * // {
 * //     foo: 'bar',
 * //     flag: '1'
 * // }
 * FamKit.getParams(''); // {}
 * @param {string} url
 * @returns {Object}
 */
export default function queryString(url: string): any;
