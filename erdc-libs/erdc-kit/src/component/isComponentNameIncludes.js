import isSameComponentName from './isSameComponentName';

/**
 * 判断一个组件名是否在一组组件名里，不区分格式
 * @param {string[]} componentNames
 * @param {string} componentName
 * @return boolean
 */
export default function isComponentNameIncludes(componentNames = [], componentName) {
    return componentNames.some(name => isSameComponentName(name, componentName));
}
