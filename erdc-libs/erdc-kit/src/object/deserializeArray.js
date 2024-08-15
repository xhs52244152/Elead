import deserializeAttr from './deserializeAttr';

/**
 * 对象属性反序列化，将后端存储的属性列表提取为普通对象信息
 * @deprecated
 * @param {Array} rawData 属性数组
 * @param {Object} options
 * @returns {Object}
 * @example
 * const rawData = [
 *     { attrName: 'code', displayName: 'STE1005', label: '工号', value: 'STE1005' },
 *     { attrName: 'displayName', displayName: '张三', label: '姓名', value: '张三' },
 *     { attrName: 'email', displayName: 'zhangsan@test.cn', label: '邮箱地址', value: 'zhangsan@test.cn' },
 *     { attrName: 'name', displayName: 'zhangsan', label: '登录账号', value: 'zhangsan' },
 *     { attrName: 'typeReference', displayName: '用户信息', label: 'typeReference', value: { id: '00001', key: 'erd.cloud.foundation.type.entity.TypeDefinitio'  } },
 *     { attrName: 'userType', displayName: '客户', label: '用户类型', value: 'CLIENT' },
 * ];
 * deserializeArray(rawData);
 * // =>
 * // {
 * //     "code": "STE1005",
 * //     "displayName": "张三",
 * //     "email": "zhangsan@test.cn",
 * //     "name": "zhangsan",
 * //     "typeReference": "erd.cloud.foundation.type.entity.TypeDefinitio",
 * //     "userType": "客户"
 * // }
 */
export default function deserializeArray(rawData = [], options = {}) {
    return deserializeAttr(rawData, options);
}
