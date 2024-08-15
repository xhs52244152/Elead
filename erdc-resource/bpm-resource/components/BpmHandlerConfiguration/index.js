/**
 * Created by shangchi li on 2012/11/16.
 * 流程更换节点处理人
 *
 */

define([
    'text!' + ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/index.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');
    return {
        name: 'BpmHandlerConfiguration',
        template,
        components: {
            BpmParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource(
                    'bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantSelect/index.js'
                )
            ),
            BpmParticipantConfig: ErdcKit.asyncComponent(
                ELMP.resource(
                    'bpm-resource/components/BpmHandlerConfiguration/components/BpmParticipantConfig/index.js'
                )
            )
        },
        props: {
            // 处理人配置
            handlerConfiguration: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            // 列头
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 外部批量处理数组
            batchArray: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 外部批量处理数据
            batchTableData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 外部批量处理列
            batchColumn: {
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
        computed: {
            // 是否有批量处理
            batchConfigArray() {
                let batchConfigArray = [];
                if (this.batchArray.length) {
                    return this.batchArray;
                }
                if (this.handlerConfiguration.length > 1) {
                    for (let i = 0; i < this.handlerConfiguration.length; i++) {
                        let item = this.handlerConfiguration[i] || {};
                        for (let j = 0; j < item.tableData.length; j++) {
                            let sitem = item?.tableData[j] || {};
                            if (
                                sitem?.memberType === 'ROLE' ||
                                sitem?.memberType === 'ORG' ||
                                sitem?.memberType === 'GROUP'
                            ) {
                                let obj = {
                                    parentId: sitem?.parentId || '',
                                    memberType: sitem?.memberType || '',
                                    participantFrom: sitem?.participantFrom || '',
                                    number: 1
                                };
                                let batchObj =
                                    _.find(batchConfigArray, {
                                        memberType: sitem.memberType,
                                        parentId: sitem.parentId
                                    }) || undefined;
                                if (batchObj) {
                                    if (
                                        batchObj?.memberType === sitem?.memberType &&
                                        batchObj?.participantFrom !== sitem?.participantFrom
                                    ) {
                                        batchConfigArray.push(obj);
                                        return;
                                    }
                                    batchObj.number += 1;
                                } else {
                                    batchConfigArray.push(obj);
                                }
                            }
                        }
                    }
                    batchConfigArray = _.filter(batchConfigArray, (item) => item.number > 1);
                }
                return batchConfigArray;
            },
            // 批量处理列
            batchConfigColumn() {
                if (this.batchColumn.length) {
                    return this.batchColumn;
                }
                let column = _.map(this.column, (item) => ErdcKit.deepClone(item)) || [];
                _.each(column, (item) => {
                    if (item?.prop === 'participantRef' && _.isFunction(item?.props?.params?.disabled)) {
                        item.props.params.disabled = ({ row }) => {
                            return row.memberType === 'OPERATOR' || row.memberType === 'USER';
                        };
                    }
                });
                return column;
            },
            // 批量处理数据
            batchConfigTableData() {
                let tableData = [];
                if (this.batchTableData.length) {
                    return this.batchTableData;
                }
                outer: for (let i = 0; i < this.batchConfigArray.length; i++) {
                    let item = this.batchConfigArray[i] || {};
                    for (let j = 0; j < this.handlerConfiguration.length; j++) {
                        let sitem = this.handlerConfiguration[j] || {};
                        for (let k = 0; k < sitem.tableData.length; k++) {
                            let titem = sitem.tableData[k] || {};
                            if (
                                titem.memberType === 'ROLE' ||
                                titem.memberType === 'ORG' ||
                                titem.memberType === 'GROUP'
                            ) {
                                if (item?.memberType === titem?.memberType && item?.parentId === titem?.parentId) {
                                    if (
                                        item?.memberType === 'ROLE' &&
                                        item?.participantFrom !== titem?.participantFrom
                                    ) {
                                        continue;
                                    }
                                    let obj = ErdcKit.deepClone({
                                        ...titem,
                                        participantRef: _.isArray(titem.participantRef) ? [] : ''
                                    });
                                    tableData.push(obj);
                                    continue outer;
                                }
                            }
                        }
                    }
                }
                return tableData;
            },
            // 是否显示批量配置按钮
            isShowParticipantConfig() {
                return this.batchConfigArray?.length;
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmHandlerConfiguration/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['处理节点名称', '批量配置处理人', '确定', '取消', '暂无数据']),
                participantConfigForm: {
                    visible: false,
                    title: ''
                }
            };
        },
        methods: {
            // 打开参与者配置弹窗
            openParticipantConfig() {
                this.popover({
                    field: 'participantConfigForm',
                    title: this.i18nMappingObj['批量配置处理人'],
                    visible: true
                });
            },
            // 参与者配置确定
            participantHandleClick() {
                let { getData } = this.$refs?.bpmParticipantConfig || {};
                let tableData = getData();
                for (let i = 0; i < tableData.length; i++) {
                    let item = tableData[i] || {};
                    for (let j = 0; j < this.handlerConfiguration.length; j++) {
                        let sitem = this.handlerConfiguration[j] || {};
                        for (let k = 0; k < sitem.tableData.length; k++) {
                            let titem = sitem.tableData[k] || {};
                            if (item.memberType === titem.memberType && item.parentId === titem.parentId) {
                                if (item.memberType === 'ROLE') {
                                    if (item.participantFrom === titem.participantFrom) {
                                        titem.participantRef = _.map(item.participantRef, (obj) => obj) || [];
                                        titem.participantRefList =
                                            _.map(item.participantRefList, (obj) => _.extend({}, obj)) || [];
                                    }
                                } else {
                                    titem.participantRef = _.map(item.participantRef, (obj) => obj) || [];
                                    titem.participantRefList =
                                        _.map(item.participantRefList, (obj) => _.extend({}, obj)) || [];
                                }
                            }
                        }
                    }
                }
                this.popover({ field: 'participantConfigForm' });
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            }
        }
    };
});
