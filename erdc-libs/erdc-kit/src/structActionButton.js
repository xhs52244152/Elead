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
export default function structActionButton(
    buttons = [],
    props = {
        moduleDto: 'moduleDto',
        actionDto: 'actionDto',
        actionLinkDtos: 'actionLinkDtos',
        children: 'children'
    }
) {
    return buttons
        .map((item) => {
            let obj = {};
            // 说明是下拉按钮
            if (item?.[props.moduleDto]) {
                obj = { ...item[props.moduleDto] };
                obj[props.children] = item[props.moduleDto]?.[props.actionLinkDtos].map((ite) => {
                    return ite?.[props.moduleDto] ? this.structActionButton([ite])[0] : ite[props.actionDto];
                });
            } else if (item?.[props.actionDto]) {
                obj = { ...item?.[props.actionDto] };
            }
            return obj;
        })
        .filter((item) => !_.isEmpty(item));
}
