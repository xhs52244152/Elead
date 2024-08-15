/**
 * 从attrRawList中提取对象的字段描述
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
 * getObjectAttr(userData, 'displayName').displayName; // => '张三'
 *
 * @param {Object} object
 * @param {string} field
 * @return {Object}
 */
export default function getObjectAttr(object: any, field: string): any;
