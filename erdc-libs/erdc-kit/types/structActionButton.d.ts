/**
 *
 * @param {Object[]} buttons 接口返回的按钮组数据
 * @param {Object} [props]
 * @param {string} [props.moduleDto='moduleDto']
 * @param {string} [props.actionDto='actionDto']
 * @param {string} [props.actionLinkDtos='actionLinkDtos']
 * @param {string} [props.children='children']
 * @returns {Object[]}
 */
export default function structActionButton(buttons?: any[], props?: {
    moduleDto?: string;
    actionDto?: string;
    actionLinkDtos?: string;
    children?: string;
}): any[];
