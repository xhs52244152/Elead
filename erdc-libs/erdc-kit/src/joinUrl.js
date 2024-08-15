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
export default function joinUrl(url, params) {
    params = params || {};
    for (let key in params) {
        let value = params[key];
        if (value) {
            value = value.toString();
            const pattern = new RegExp('\\b' + key + '=([^&]*)');
            const replaceText = key + '=' + encodeURIComponent(value);
            url = url.match(pattern)
                ? url.replace(pattern, replaceText)
                : url.match('[\\?]')
                  ? url + '&' + replaceText
                  : url + '?' + replaceText;
        }
    }
    return url;
}
