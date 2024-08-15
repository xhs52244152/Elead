/**
 * 对象属性反序列化，将后端存储的属性列表提取为普通对象信息
 * @typedef {{ [attrName:string]: { attrName: string, displayName: string }}} RawData
 * @param {RawData} rawData
 * @param {object} [options = {}]
 * @param {{ attrMame: (attrObject:{ attrName: string, displayName: string }, rawData: Object) => any }} options.valueMap
 * @param {string} [options.valueKey = 'value']
 * @param {boolean} options.isI18n
 * @return {Object}
 * @example
 * const rawData = {
 *     code: { attrName: 'code', displayName: 'STE1005', label: '工号', value: 'STE1005' },
 *     displayName: { attrName: 'displayName', displayName: '张三', label: '姓名', value: '张三' },
 *     email: { attrName: 'email', displayName: 'zhangsan@test.cn', label: '邮箱地址', value: 'zhangsan@test.cn' },
 *     name: { attrName: 'name', displayName: 'zhangsan', label: '登录账号', value: 'zhangsan' },
 *     typeReference: { attrName: 'typeReference', displayName: '用户信息', label: 'typeReference', value: { id: '00001', key: 'erd.cloud.foundation.type.entity.TypeDefinitio'  } },
 *     userType: { attrName: 'userType', displayName: '客户', label: '用户类型', value: 'CLIENT' },
 * };
 *
 * deserializeAttr(rawData);
 * // =>
 * // {
 * //     "code": "STE1005",
 * //     "displayName": "张三",
 * //     "email": "zhangsan@test.cn",
 * //     "name": "zhangsan",
 * //     "typeReference": { "id": "00001", "key": "erd.cloud.foundation.type.entity.TypeDefinitio" },
 * //     "userType": "CLIENT"
 * // }
 */
export default function deserializeAttr(rawData, options = {}) {
    let temp = {};
    if (Array.isArray(rawData)) {
        rawData.forEach((attr) => {
            // res[attr.attrName] = attr[valueKey]
            temp[attr.attrName] = attr;
        });
    } else {
        temp = rawData;
    }

    const { valueMap = {}, valueKey = 'value', isI18n = false } = options;
    let res = {};
    Object.keys(temp).forEach((key) => {
        let val = temp[key]?.[valueKey];
        if (valueMap && valueMap[temp[key]?.attrName]) {
            val = valueMap[temp[key]?.attrName](temp[key], temp);
        } else if (key.includes('I18nJson')) {
            if (isI18n) {
                val = temp[key]?.[valueKey];
            } else {
                val = {
                    attrName: temp[key]?.attrName,
                    value: temp[key]?.[valueKey]
                };
            }
        }
        res[key] = val;
    });
    return res;
}
