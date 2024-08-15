/**
 * 设置字段的值，支持深层设置。如果生成的对象需要是一个响应式, 则需要将组件示例传进来。
 * @param {Object} sourceObject
 * @param {String} field
 * @param {*} value
 * @param {import('vue').Component} [_this]
 * @param {'_'|'.'} [concatenator='_']
 * @example
 *
 * const sourceObject = {};
 * const filed = 'aa_bb_cc';
 * const value = ['aa'];
 *
 * setFieldValue(sourceObject, field, value);
 * // => {
 * //      aa: {
 * //          bb: {
 * //              cc: ['aa']
 * //          }
 * //      }
 * //    }
 */
export default function setFieldValue(
    sourceObject: any,
    field: string,
    value: any,
    _this?: Component,
    concatenator?: '_' | '.'
): void;
