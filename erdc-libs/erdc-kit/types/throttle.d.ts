/**
 * 节简单流函数
 * @param {function} func 间隔时间内触发的方法
 * @param {number} [delay=100] 间隔时间
 * @returns {function(...args: any[]): any}
 */
export default function throttle(func: Function, delay?: number): (...args: args[]) => any[];
