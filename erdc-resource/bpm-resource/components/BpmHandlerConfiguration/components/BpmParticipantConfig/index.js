/**
 * Created by shangchi li on 2012/11/16.
 * 流程更换节点处理人
 *
 */

define([
    'text!' +
        ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantConfig/index.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantConfig/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');
    return {
        template,
        components: {
            BpmParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource(
                    'bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantSelect/index.js'
                )
            )
        },
        props: {
            tableData: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 外部批量配置默认选中全部人员
            batchDefaultSelect: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                innerTableData: [],
                innerColumn: []
            };
        },
        watch: {
            tableData: {
                handler: function (n) {
                    this.innerTableData = _.map(n, (item) => _.extend({}, item));
                },
                immediate: true,
                deep: true
            },
            column: {
                handler: function (n) {
                    let column = _.map(n, (item) => _.extend({}, item));
                    if (!_.some(column, (item) => item.type === 'seq')) {
                        column.unshift({ type: 'seq', title: '', fixed: 'left', width: '40', minWidth: '40' });
                    }
                    this.innerColumn = column;
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            // 批量配置默认选中全部人员
            batchConfigDefaultSelect() {
                this.$emit('batch-config-default-select', this.innerColumn, this.innerTableData);
            },
            getData() {
                return this.innerTableData;
            }
        }
    };
});
