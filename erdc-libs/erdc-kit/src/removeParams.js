import getParams from './getParams';

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
export default function removeParams(url, params) {
    const originParams = getParams(url);
    const paramsArray = Array.isArray(params)
        ? params
        : params && typeof params === 'object'
          ? Object.keys(params)
          : [params].filter(Boolean);
    paramsArray.forEach((key) => {
        if (Object.hasOwn(originParams, key)) {
            delete originParams[key];
        }
    });
    if (Object.keys(originParams).length === 0) {
        return url;
    }
    return `${url.split('?')[0]}?${Object.keys(originParams)
        .map((key) => `${key}=${originParams[key]}`)
        .join('&')}`;
}
