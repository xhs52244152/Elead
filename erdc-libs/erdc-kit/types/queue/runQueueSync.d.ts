/**
 * 遍历一个同步伪数组，忽略 undefined
 * f(a1） -> f(a2） -> f(a3）
 * @param {Array|{ length: number }} queue - 目标队列
 * @param {function(item: number, index: number): void} iterator - 迭代函数
 * @param {function} callback - 事务完成回调函数
 * @returns {ReturnType<callback>}
 */
export default function runQueueSync(queue: any[] | {
    length: number;
}, iterator: any, callback: Function): ReturnType<Function>;
