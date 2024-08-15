import getObjectAttr from './getObjectAttr';

/**
 * 从对象的attrRawList里提取指定字段的值
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
 * getObjectAttrValue(userData, 'oid'); // '20230202001'
 *
 * @param {Object} object
 * @param {string}field
 * @return {any}
 */
export default function getObjectAttrValue(object, field) {
    const valueObject = getObjectAttr(object, field);
    return valueObject && typeof valueObject === 'object' ? valueObject.value : object[field];
}
