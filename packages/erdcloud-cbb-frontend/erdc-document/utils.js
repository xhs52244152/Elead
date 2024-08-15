// onlyOffice
define([ELMP.resource('erdc-cbb-components/utils/index.js')], function (utils) {
    // 建议使用erdc-cbb-components/utils的通用详情跳转方法，该方法后续会移除
    // 查看对象详情
    async function goToDetail(row) {
        return utils.goToDetail(row);
    }

    return {
        /**
         *图标颜色
         *@param {Array | Object} attrData  属性数据。表格中取到的原始数据是数组，对象中渠道
         */
        getIconClass(attrData, className) {
            var result = {};

            const iterationInfoStateProp = className ? `${className}#iterationInfo.state` : 'iterationInfo.state';
            const lifecycleStatusProp = className ? `${className}#lifecycleStatus.status` : 'lifecycleStatus.status';
            const stateProp = className ? `${className}#lifecycleStatus.status` : 'state';
            const generalStatusProp = className ? `${className}#generalStatus` : 'generalStatus';

            let iconData = attrData;
            if (Array.isArray(attrData)) {
                iconData = {};
                attrData.forEach((item) => {
                    const attrName = className ? item?.attrName : item?.attrName?.split('#')?.reverse()[0];
                    if (
                        attrName === iterationInfoStateProp ||
                        attrName === lifecycleStatusProp ||
                        attrName === generalStatusProp ||
                        attrName === stateProp
                    ) {
                        iconData[attrName] = item.value;
                    }
                });
            }

            // 检出状态
            if (iconData[iterationInfoStateProp] == 'WORKING' || iconData[stateProp] == 'WORKING') {
                result = {
                    color: '#FCB11E'
                };
            }
            // 已检出
            else if (iconData[iterationInfoStateProp] == 'CHECKED_OUT' || iconData[stateProp] == 'CHECKED_OUT') {
                // 原始版本
                result = {
                    color: 'orange'
                };
            }
            // 检入状态
            else if (iconData[iterationInfoStateProp] == 'CHECKED_IN' || iconData[stateProp] == 'CHECKED_IN') {
                result = {
                    color: '#246DE6'
                };
            }
            // 草稿状态
            if (
                iconData[lifecycleStatusProp] === 'DRAFT' ||
                iconData[generalStatusProp] == 'uploadOnly' ||
                iconData[stateProp] == 'DRAFT'
            ) {
                result = {
                    color: '#8B572A'
                };
            }
            return result;
        },
        // 建议使用erdc-cbb-components/utils的通用上下文和文件夹跳转方法，该方法后续会移除
        // 上下文跳转方法
        handleGoToSpace(data, type) {
            return utils.handleGoToSpace(data, type);
        },
        // 跳转详情
        goToDetail
    };
});
