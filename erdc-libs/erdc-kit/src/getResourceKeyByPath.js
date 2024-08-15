/**
 * 根据路径获取资源包 key
 * @param {string} path
 * @returns {string|''}
 */
export default function getResourceKeyByPath(path) {
    if (!path) return '';
    const reg = /^\/?.*?\/([^/]*)/;
    return path.match(reg)[1];
}
