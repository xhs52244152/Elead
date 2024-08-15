import getParams from './getParams';

/**
 * 获取地址栏参数
 * @param {string} key
 * @returns {string}
 */
export default function getParam(key) {
    return getParams()[key];
}
