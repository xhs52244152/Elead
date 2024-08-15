/**
 * 间隔 TIMEOUT毫秒，最多 options.limit 次轮流查询 condition，当 condition 成立，执行 func
 * @param {function: boolean} [condition]
 * @param {function} [func]
 * @param {Object} [options]
 * @param {number} [options.limit=100]
 * @param {number} [options.timeout=100]
 * @param {function} [options.onFail]
 */
export default function deferredUntilTrue(
    condition = () => true,
    func = () => {
        //do nothing
    },
    {
        limit = 100,
        timeout = 100,
        onFail = () => {
            //do nothing
        }
    } = {}
) {
    if (condition()) {
        setTimeout(() => {
            func && func();
        }, 0);
        return;
    }
    let t = null;
    let count = 0;
    (function waitCondition() {
        count++;
        clearTimeout(t);
        t = null;
        if (count > limit) {
            onFail && onFail();
            return;
        }
        t = setTimeout(function () {
            if (condition()) {
                func && func();
                clearTimeout(t);
                t = null;
            } else {
                waitCondition();
            }
        }, timeout);
    })();
}
