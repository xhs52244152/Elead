/**
 * 将配置的json key-value类型的脚本字符串转换脚本
 * @param {string} data 待合并的对象，value为js
 * @param {window|Object} globalTarget 只能为window 或者window上的某个对象的全局对象,因为 eval 只能访问全局变量
 * @return {Object}
 * @example
 * ```javascript
 * let data = {"ELCONF.feat.defaultHeader": "function () {return {token: 'tokenStr'}}"};
 * console.log(stringExpressionToObject(data));
 * ```
 */
export default function stringExpressionToObject(data: string, globalTarget: window | any): any;
