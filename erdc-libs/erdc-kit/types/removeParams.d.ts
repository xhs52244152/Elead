/**
 * 将URL中的参数删掉
 * @example
 * ```javascript
 * removeParams("/aa/bb.html?code=123223&param2=param", ['code']) --> '/aa/bb.html?param2=param'
 * ```
 * @param {string} url
 * @param {string[]} params
 * @returns {string}
 */
export default function removeParams(url: string, params: string[]): string;
