/**
 * 遍历一个同步伪数组，忽略 undefined
 * f(a1） -> f(a2） -> f(a3）
 * @param {Array|{ length: number }} queue - 目标队列
 * @param {function(item: number, index: number): void} iterator - 迭代函数
 * @param {function} callback - 事务完成回调函数
 * @returns {ReturnType<callback>}
 */
export default function runQueueSync(queue, iterator, callback) {
    const step = (index) => {
        if (index >= queue.length) {
            return callback();
        } else {
            if (queue[index] !== undefined) {
                iterator(queue[index], index);
                return step(index + 1);
            } else {
                return step(index + 1);
            }
        }
    };
    return step(0);
}
