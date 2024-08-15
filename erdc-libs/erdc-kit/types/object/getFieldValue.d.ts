/**
 * 获取对象属性值，支持深层获取
 * @param {Object} sourceObject
 * @param {string} field
 * @param {import('vue').Component} [_this]
 * @param {'_'|'.'} concatenator - 连接符
 * @returns {any}
 */
export default function getFieldValue(
    sourceObject: any,
    field: string,
    _this?: Component,
    concatenator?: '_' | '.'
): any;
