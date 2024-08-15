/**
 * 将 params 拼接到 url
 * @param {string} url
 * @param {Object<string, string>} params
 * @returns {string}
 * @example
 * ```javascript
 * joinUrl('http://www.baidu.com?s=xxx', { a: '1', b: '2' }); // http://www.baidu.com?s=xxx&a=1&b=2
 * ```
 */
export default function joinUrl(url: string, params: {
    [x: string]: string;
}): string;
