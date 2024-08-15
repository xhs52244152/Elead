import { pascalize } from '../index';

/**
 * 判断两个组件名是否一致，不区分格式
 * @param {string} componentName1
 * @param {string} componentName2
 * @return boolean
 */
export default function isSameComponentName(componentName1, componentName2) {
    return pascalize(componentName1) === pascalize(componentName2);
}
