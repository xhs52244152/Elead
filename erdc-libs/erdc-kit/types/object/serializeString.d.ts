/**
 将 JavaScript 对象序列化为 URL 查询字符串
 * Reference to jQuery.js
 * @example
 * serialize({ foo: 'bar', flag: 1 }); // foo=bar&flag=1
 * serialize({}); // ''
 * serialize({ name: '张三' }); // 'name=%E5%BC%A0%E4%B8%89'
 *
 * @param {Object} sourceObject - 要序列化的 JavaScript 对象。
 * @param {boolean} [traditional=false] - 是否使用传统的方式来处理数组。
 * @return {string} - 序列化后的 URL 查询字符串。
 */
export default function serializeString(sourceObject: any, traditional?: boolean): string;
