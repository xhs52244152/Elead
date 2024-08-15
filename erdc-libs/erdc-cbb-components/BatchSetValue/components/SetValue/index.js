define([
    'text!' + ELMP.resource('erdc-cbb-components/BatchSetValue/components/SetValue/index.html'),
    ELMP.resource('erdc-cbb-components/BatchSetValue/customProps.js'),
    'css!' + ELMP.resource('erdc-cbb-components/BatchSetValue/components/SetValue/index.css')
], function (template, customProps) {
    const ErdcKit = require('erdc-kit');
    
    return {
        name: 'SetValue',
        template,
        mixins: [customProps],
        props: {
            className: {
                type: String,
                required: true
            },
            containerRef: String
        },
        components: {
            FamTableColSet: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/BatchSetValue/locale/index.js'),
                // 数据源
                sourceData: [],
                // 表格数据
                tableData: [],
                // 列配置弹窗
                visible: false
            };
        },
        computed: {
            // 列头穿梭框
            columnsList() {
                return _.map(this.sourceData, (item) => _.pick(item, 'displayName', 'attrName'));
            },
            // 默认选中数据
            defaultColumns() {
                return _.map(this.tableData, (item) => {
                    return _.find(this.columnsList, { attrName: item?.attrName });
                });
            },
            // 下拉框数据源
            optionInfo() {
                return _.reduce(
                    this.tableData,
                    (prev, next, index, tableData) => {
                        const optionList = _.map(this.sourceData, (item) => {
                            return {
                                label: item?.displayName || '',
                                value: item?.attrName || '',
                                disabled: _.chain(tableData)
                                    .filter((item) => item !== next)
                                    .map('attrName')
                                    .value()
                                    .includes(item?.attrName)
                            };
                        });
                        return { ...prev, [next.attrName]: optionList };
                    },
                    {}
                );
            },
            // 组件信息
            componentInfo() {
                return _.reduce(
                    this.sourceData,
                    (prev, next) => {
                        return { ...prev, [next.attrName]: next };
                    },
                    {}
                );
            }
        },
        watch: {
            className: {
                handler: function (className) {
                    if (className) {
                        this.getObjectPropertyDetails({
                            className,
                            attrAccessCategory: 'UPDATE',
                            containerRef: this.containerRef
                        });
                    }
                },
                immediate: true
            }
        },
        methods: {
            // 删除属性
            deleteFiled(row) {
                this.tableData = _.filter(this.tableData, (item) => item !== row);
            },
            // 添加属性
            addField() {
                this.visible = true;
            },
            // 类型选中触发
            changeField(row, item) {
                row.value = '';
                item.value = '';
            },
            // 值改变触发
            // eslint-disable-next-line no-unused-vars
            fieldChange(row, val, sourceData) {
                // typeof sourceData !== 'undefined' && (this.sourceDataEcho[row?.value] = sourceData);
            },
            // 获取属性详情
            getObjectPropertyDetails(params) {
                this.$famHttp({
                    url: '/fam/type/attribute/listTypeAccessAttribute',
                    method: 'get',
                    params,
                    unSubPrefix: true
                }).then((res) => {
                    if (res.success) {
                        let { data = [] } = res || {};
                        this.sourceData = ErdcKit.deepClone(data) || [];
                    }
                });
            },
            // 选中列头回调
            fnColSettingSubmit(e) {
                let tableData = ErdcKit.deepClone(e.selectedColumns) || [];
                if (tableData?.length && this.tableData?.length) {
                    let aList = _.difference(_.map(tableData, 'attrName'), _.map(this.tableData, 'attrName'));
                    let jList = _.difference(_.map(this.tableData, 'attrName'), _.map(tableData, 'attrName'));
                    jList = _.reduce(
                        this.tableData,
                        (prev, next) => {
                            !jList.includes(next?.attrName) && prev.push(next);
                            return prev;
                        },
                        []
                    );
                    tableData = jList.concat(_.filter(tableData, (item) => aList.includes(item?.attrName)));
                }
                tableData = _.map(tableData, (item) => {
                    return {
                        attrName: item?.attrName,
                        value: item?.value || ''
                    };
                });
                this.tableData = ErdcKit.deepClone(tableData);
            },
            // 获取更新的数据
            getAttrData() {
                return _.map(this.tableData, (item) => _.extend({}, ErdcKit.deepClone(item)));
            }
        }
    };
});
