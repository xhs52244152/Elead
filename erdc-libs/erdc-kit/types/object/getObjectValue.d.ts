/**
 * 从对象获取指定的字段，可以获取深度字段
 * @example
 * getObjectValue({ a: { a1: 1 } }, 'a.a1'); // => 1
 * getObjectValue({ a: { a1: 1 } }, 'b.a1', 0); // => 0
 *
 * @param {Object} sourceObjet - 源对象
 * @param {string} field - 获取的值
 * @param {any} [defaultValue] - 获取失败时返回的默认值
 * @return {any}
 */
export default function getObjectValue(sourceObjet?: any, field?: string, defaultValue?: any): any;
