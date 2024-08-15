/**
 * 规范化路径
 * @param {string} path
 * @returns {string}
 */
export default function normalizePath(path) {
    return path?.replace(/^\//, '').replace(/\/\//g, '/');
}
