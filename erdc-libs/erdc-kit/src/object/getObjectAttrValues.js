import getObjectAttrValue from './getObjectAttrValue';

/**
 * 从对象的attrRawList里提取一组对象的属性与对应值
 * @example
 * const userData = {
 *     oid: '20230202001',
 *     displayName: '张三',
 *     attrList: [{
 *         oid: 'attr20230202001',
 *         value: '张三',
 *         label: '姓名',
 *         displayName: '张三',
 *         attrKey: 'displayName'
 *     }, {
 *         oid: 'attr20230202002',
 *         value: 'zhangsan@test.cn',
 *         label: '邮箱',
 *         displayName: 'zhangsan@test.cn',
 *         attrKey: 'email'
 *     }, {
 *         oid: 'attr20230202003',
 *         value: 'ORG20230202001',
 *         label: '所属部门',
 *         displayName: '易立德研发中心',
 *         attrKey: 'erdcloud.foundation.org#orgName'
 *     }]
 * };
 *
 * getObjectAttrValues(userData, ['oid', 'displayName', 'email', 'orgName', 'foobar']);
 * // =>
 * // {
 * //     oid: '20230202001',
 * //     displayName: '张三',
 * //     email: 'zhangsan@test.cn',
 * //     orgName: '易立德研发中心',
 * //     foobar: undefined
 * // }
 *
 * @param {Object} object
 * @param {string[]} fields
 * @return {Object}
 */
export default function getObjectAttrValues(object, fields) {
    return fields.reduce((prev, field) => {
        prev[field] = getObjectAttrValue(object, field);
        return prev;
    }, {});
}
