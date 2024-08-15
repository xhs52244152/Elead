define([ELMP.resource('platform-api/util/swagger.js')], function (Swagger) {
    'use strict';

    function isBasicType(type) {
        const types = ['string', 'integer', 'number', 'object', 'boolean', 'int32', 'int64', 'float', 'double'];
        return types.includes(type);
    }

    function getBasicTypeValue(type) {
        let propValue = '';
        switch (type) {
            case 'integer':
                propValue = 0;
                break;
            case 'boolean':
                propValue = true;
                break;
            case 'object':
                propValue = {};
                break;
            case 'number':
                propValue = parseFloat(0);
                break;
            default:
                break;
        }

        return propValue;
    }

    function checkParamArrsExists(arr, obj) {
        return arr.findIndex((item) => item.name === obj.name) !== -1;
    }

    function checkPropertiesExists(arr, obj) {
        return arr.findIndex((item) => item.name === obj.name && item.in === obj.in && item.type === obj.type) !== -1;
    }

    function getClassName(value) {
        const regex = new RegExp('#/definitions/(.*)$', 'ig');

        return regex.test(value) ? RegExp.$1 : null;
    }

    function replaceMultipLineStr(str) {
        if (str !== null && str !== undefined && str !== '') {
            var newLinePattern = /(\r\n|\n\r|\r|\n)/g;
            if (newLinePattern.test(str)) {
                return str.replace(newLinePattern, '\\n');
            }
            return str;
        }
        return '';
    }

    /***
     * 根据类名查找definition
     */
    function getDefinitionByName(currentInstance, name) {
        return currentInstance.difArrs.find((item) => item.name === name);
    }

    return {
        isBasicType: isBasicType,
        getBasicTypeValue: getBasicTypeValue,
        checkPropertiesExists: checkPropertiesExists,
        getClassName: getClassName,
        replaceMultipLineStr: replaceMultipLineStr,
        checkParamArrsExists: checkParamArrsExists,
        getDefinitionByName: getDefinitionByName
    };
});
