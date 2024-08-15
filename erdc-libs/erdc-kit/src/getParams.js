import queryString from './queryString';

/**
 * 获取所有地址栏参数
 * @param {string} [url=window.location.hash]
 * @returns {Object<string, string>}
 */
export default function getParams(url) {
    const _url = arguments.length ? url : window.location.hash;
    if (_url && _url.indexOf('?') !== -1) {
        return queryString(_url.split('?')[1]);
    }
    return {};
}
