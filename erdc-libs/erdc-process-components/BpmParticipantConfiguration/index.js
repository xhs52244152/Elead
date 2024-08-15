define([
    'text!' + ELMP.resource('erdc-process-components/BpmParticipantConfiguration/index.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmParticipantConfiguration/index.css')
], function(template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'BpmParticipantConfiguration',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            // 处理人配置
            handlerConfiguration: {
                type: Array,
                default: function() {
                    return [];
                }
            },
            // 列头
            column: {
                type: Array,
                default: function() {
                    return [];
                }
            }
        },
        methods: {
            getPropsProperty({ row, column }) {
                let props = {};
                _.each(column.params, (value, key) => {
                    props[key] = _.isFunction(value) ? value({ row, column }) : value;
                });
                return props;
            },
            // 下拉框选中值变化
            optionsChange(val, data, scope) {
                this.$emit('options-change', val, data, scope);
            },
            mergeRowMethod({ row, _rowIndex, column, visibleData }) {
                const fields = ['nodeName'];
                const cellValue = row[column.field];
                if (cellValue && fields.includes(column.field)) {
                    const prevRow = visibleData[_rowIndex - 1];
                    let nextRow = visibleData[_rowIndex + 1];
                    if (prevRow && prevRow[column.field] === cellValue) {
                        return { rowspan: 0, colspan: 0 };
                    } else {
                        let countRowspan = 1;
                        while (nextRow && nextRow[column.field] === cellValue) {
                            nextRow = visibleData[++countRowspan + _rowIndex];
                        }
                        if (countRowspan > 1) {
                            return { rowspan: countRowspan, colspan: 1 };
                        }
                    }
                }
            }
        }
    };
});
