/**
 * 节简单流函数
 * @param {function} func 间隔时间内触发的方法
 * @param {number} [delay=100] 间隔时间
 * @returns {function(...args: any[]): any}
 */
export default function throttle(func, delay = 100) {
    let startTime = 0;

    return function (...args) {
        const now = Date.now();
        if (now - startTime < delay) {
            return;
        }
        startTime = now;
        return func(...args);
    };
}
