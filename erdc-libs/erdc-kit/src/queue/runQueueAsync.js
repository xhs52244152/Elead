/**
 * 遍历一个异步伪数组，忽略 undefined
 * f(a1） -> f(a2） -> f(a3）
 * @param {Array|{ length: number }} queue - 目标队列
 * @param {function(item: number, index: number, next: function): void} iterator - 迭代函数
 * @param {function} callback - 事务完成回调函数
 * @returns {ReturnType<typeof callback>}
 */
export default function runQueueAsync(queue, iterator, callback) {
    const step = function (index) {
        if (index >= queue.length) {
            return callback();
        } else {
            if (queue[index] !== undefined) {
                return iterator(queue[index], index, function () {
                    step(index + 1);
                });
            } else {
                return step(index + 1);
            }
        }
    };
    return step(0);
}
