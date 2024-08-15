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
export default function queryString(url) {
    url = url.indexOf('?') !== -1 ? url.split('?')[1] : url;
    const params = {};
    const queryParams = url.split('&');
    for (let i = 0; i < queryParams.length; i++) {
        if (queryParams[i].indexOf('=') !== -1) {
            const hash = queryParams[i].split('=');
            try {
                params[hash[0]] = window.decodeURIComponent(window.decodeURIComponent(hash[1].replace(/%2B/gi, ' ')));
            } catch (e) {
                return null;
            }
        }
    }
    return params;
}
