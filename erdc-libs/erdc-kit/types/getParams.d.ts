/**
 * 获取所有地址栏参数
 * @param {string} [url=window.location.hash]
 * @returns {Object<string, string>}
 */
export default function getParams(url?: string, ...args: any[]): {
    [x: string]: string;
};
