// onlyOffice
define([
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-pdm-common-actions/utils.js'),
    'vue'
], function (utils, commonActionUtils, Vue) {
    const router = require('erdcloud.router');
    const FamStore = require('erdcloud.store');

    /**
     *图标颜色
     *@param {Array | Object} attrData  属性数据。表格中取到的原始数据是数组，对象中渠道
     */
    function getIconClass(attrData, className) {
        var result = {};

        let iterationInfoStateProp = `${className}#iterationInfo.state`;
        let lifecycleStatusProp = `${className}#lifecycleStatus.status`;
        let stateProp = `${className}#lifecycleStatus.status`;
        let generalStatusProp = `${className}#generalStatus`;

        //取第一个属性检测有没有前缀，没有前缀取名称,默认时字段带前缀
        if (attrData?.[0]?.attrName.indexOf('#') == -1) {
            iterationInfoStateProp = 'iterationInfo.state';
            lifecycleStatusProp = 'lifecycleStatus.status';
            stateProp = 'state';
            generalStatusProp = 'generalStatus';
        }

        let iconData = attrData;
        if (Array.isArray(attrData)) {
            iconData = {};
            attrData.forEach((item) => {
                if (
                    item.attrName === iterationInfoStateProp ||
                    item.attrName === lifecycleStatusProp ||
                    item.attrName === generalStatusProp ||
                    item.attrName === stateProp
                ) {
                    iconData[item.attrName] = item.value;
                }
            });
        }
        //部件、文档、模型颜色设置，else里面是变更模块颜色设置
        if (className?.indexOf('change') == -1) {
            // 检出状态
            if (iconData?.[iterationInfoStateProp] == 'WORKING' || iconData?.[stateProp] == 'WORKING') {
                result = {
                    color: '#FCB11E'
                };
            }
            // 已检出
            else if (iconData?.[iterationInfoStateProp] == 'CHECKED_OUT' || iconData?.[stateProp] == 'CHECKED_OUT') {
                // 原始版本
                result = {
                    color: 'orange'
                };
            }
            // 检入状态
            else if (iconData?.[iterationInfoStateProp] == 'CHECKED_IN' || iconData?.[stateProp] == 'CHECKED_IN') {
                result = {
                    color: '#246DE6'
                };
            }
        } else {
            // 草稿状态
            if (
                iconData?.[lifecycleStatusProp] === 'DRAFT' ||
                iconData?.[generalStatusProp] == 'uploadOnly' ||
                iconData?.[stateProp] == 'DRAFT'
            ) {
                result = {
                    color: '#8B572A'
                };
            } else {
                result = {
                    color: '#246DE6'
                };
            }
        }

        return result;
    }
    // 建议使用erdc-cbb-components/utils的通用上下文和文件夹跳转方法，该方法后续会移除
    // 上下文跳转方法
    function handleGoToSpace(data, type) {
        return utils.handleGoToSpace(data, type);
    }

    // 建议使用erdc-cbb-components/utils的通用详情跳转方法，该方法后续会移除
    // 查看对象详情
    // isChangeRelation 关联的对象列表
    async function goToDetail(row, backButton, isChangeRelation = false, customRoute) {
        return utils.goToDetail(row, { ...customRoute, backButton }, null, null, isChangeRelation);
    }

    /**
     * 国际化组件去除前后空格
     * @param {Object} data 国际化组件返回的数据
     */
    const trimI18nJson = function (data) {
        let value = data || {};
        Object.keys(value).forEach((key) => {
            value[key] = value[key] && value[key].trim();
        });
    };

    // 根据vue options渲染组件
    const useFreeComponent = function (vueOptions) {
        let instance = new Vue({
            store: FamStore,
            router: router,
            ...vueOptions
        });

        instance.$mount();

        let destroy = function () {
            instance.$destroy();
        };

        return {
            instance,
            destroy
        };
    };

    function getTypeString(target) {
        return Object.prototype.toString.call(target).replace(/\[object |]/g, '');
    }

    // 递归获取对象prop
    let brokenArr = [undefined, null];
    function getProp(target, key = '', init, forceType = false) {
        if (brokenArr.includes(target) || brokenArr.includes(key) || !key) {
            return init;
        }
        let { currentKey, _key } = getCurrentKeyForPropFunc(key),
            _target = target[currentKey];
        if (!_key) {
            if (target === void 0 || (forceType && getTypeString(_target) !== getTypeString(init))) {
                _target = init;
            }
            if (_.isFunction(_target) && _.isFunction(init)) {
                let fn = _target.bind(target);
                fn.native = _target;
                fn.bind = function (context) {
                    return this.native.bind(context);
                };
                return fn;
            }
            return _target;
        }
        return getProp(_target, _key, init, forceType);
    }

    function setProp(target, key = '', value) {
        if (brokenArr.includes(target) || brokenArr.includes(key) || !key) {
            return null;
        }
        let { currentKey, _key } = getCurrentKeyForPropFunc(key);
        if (!_key) {
            return target ? (target[currentKey] = value) : null;
        }
        return setProp(target[currentKey], _key, value);
    }

    function getCurrentKeyForPropFunc(key) {
        let currentKey = '',
            end = false,
            i = 0,
            keyLength = key.length;
        if (!/^\[/.test(key)) {
            // 开头不是方括号的情况
            while (i < keyLength && !end) {
                if (key[i] === '.') {
                    end = true;
                } else {
                    currentKey += key[i];
                }
                i++;
            }
        } else {
            // 记录左中括号的数量 防止多重括号
            let leftBracketCount = 1;
            while (i < keyLength && !end) {
                if (key[i] === '[') {
                    leftBracketCount++;
                } else if (key[i] === ']') {
                    leftBracketCount--;
                } else if (leftBracketCount === 1 && key[i] === '.') {
                    end = true;
                } else {
                    currentKey += key[i];
                }
                i++;
            }
        }
        return { currentKey, _key: key.slice(i) };
    }

    // 批量改下跳转封装内取className用到的key
    // 定义检索的 key和优先级
    const relationObjectKeys = ['relationOid', 'oid'];
    function getClassNameKey(row) {
        // 可以尝试优化成 relationObjectKeys.at(-1)
        return relationObjectKeys.find((key) => row[key]) || relationObjectKeys[relationObjectKeys.length - 1];
    }
    function getAttrFromAttrRowList(attrList = [], key = '') {
        if (!Array.isArray(attrList) || !key) return null;
        return (
            attrList.find((attrObject) => {
                if (!attrObject.attrName) return;
                if (key.includes('#')) return attrObject.attrName === key;
                return (
                    (attrObject.attrName.includes('#') ? attrObject.attrName.split('#')[1] : attrObject.attrName) ===
                    key
                );
            }) || null
        );
    }
    function getItem(key = '', initValue) {
        try {
            let r = JSON.parse(localStorage.getItem(key));
            if (!initValue) {
                return r;
            }
            return typeof initValue === typeof r ? r : initValue;
        } catch (err) {
            console.error(err);
            return initValue;
        }
    }

    function setItem(key = '', value) {
        return localStorage.setItem(key, JSON.stringify(value));
    }

    return {
        goToDetail,
        getIconClass,
        handleGoToSpace,
        trimI18nJson,
        useFreeComponent,
        getProp,
        setProp,
        coverDataFromAttrRowList: commonActionUtils.coverDataFromAttrRowList,
        getClassNameKey,
        getAttrFromAttrRowList,

        IStorage: {
            getItem,
            setItem
        }
    };
});
