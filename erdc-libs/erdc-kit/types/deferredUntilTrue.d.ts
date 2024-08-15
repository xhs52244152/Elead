/**
 * 间隔 TIMEOUT毫秒，最多 options.limit 次轮流查询 condition，当 condition 成立，执行 func
 * @param {function: boolean} [condition]
 * @param {function} [func]
 * @param {Object} [options]
 * @param {number} [options.limit=100]
 * @param {number} [options.timeout=100]
 * @param {function} [options.onFail]
 */
export default function deferredUntilTrue(condition?: () => boolean, func?: Function, { limit, timeout, onFail }?: {
    limit?: number;
    timeout?: number;
    onFail?: Function;
}): void;
