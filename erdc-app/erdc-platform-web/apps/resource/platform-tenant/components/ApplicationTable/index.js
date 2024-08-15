define([
    'text!' + ELMP.resource('platform-tenant/components/ApplicationTable/index.html'),
    'css!' + ELMP.resource('platform-tenant/components/ApplicationTable/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            isEditStatus: {
                type: Boolean,
                default: true
            },
            applications: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            isShowOperation: {
                type: Boolean,
                default: true
            }
        },
        components: {
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-tenant/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    description: this.getI18nByKey('描述'),
                    remove: this.getI18nByKey('移除'),
                    version: this.getI18nByKey('版本号'),
                    operation: this.getI18nByKey('操作')
                }
            };
        },
        computed: {
            tableData() {
                const tableData = _.map(this.applications, item => ErdcKit.deepClone(item)) || [];
                _.each(tableData, item => {
                    _.each(item, (value, key) => {
                        (value === '' || value === undefined) && (item[key] = '--');
                    })
                })
                return tableData;
            },
            tableColumns() {
                let tableConfig = [
                    {
                        prop: 'displayName', // 属性名
                        title: this.i18nMappingObj.name, // 字段名
                        width: 150
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18nMappingObj.number,
                        width: 150
                    },
                    // {
                    //     prop: 'version',
                    //     title: this.i18nMappingObj.version,
                    //     width: 150
                    // },
                    {
                        prop: 'displayDesc',
                        title: this.i18nMappingObj.description,
                        minWidth: 220
                    }
                ];
                if (this.isEditStatus) {
                    tableConfig = [
                        {
                            prop: 'checkbox', // 列数据字段key
                            type: 'checkbox',
                            width: 40,
                            align: 'center'
                        },
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq',
                            title: ' ', // 特定类型 复选框[checkbox] 单选框[radio]
                            width: 48,
                            align: 'center'
                        },
                        ...tableConfig,
                        {
                            prop: 'operation',
                            title: this.i18nMappingObj.operation,
                            width: 100
                        }
                    ];
                } else {
                    tableConfig = [
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq',
                            title: ' ', // 特定类型 复选框[checkbox] 单选框[radio]
                            width: 48,
                            align: 'center'
                        },
                        ...tableConfig
                    ];
                }
                return tableConfig;
            }
        },
        watch: {},
        mounted() {},
        methods: {
            handlerRemove(data) {
                this.$emit('removeApplication', data.row);
            },
            getSelection() {
                const selectData = this.$refs['applicationTable'].$table.getCheckboxRecords();
                return selectData;
            },
            checkMethod({row}) {
                return !row?.isDefault
            }
        }
    };
});
