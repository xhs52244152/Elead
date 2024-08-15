define([
    'text!' + ELMP.resource('system-operation-menu/components/Checker/index.html'),
    'css!' + ELMP.resource('system-operation-menu/components/Checker/style.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');
    let obtainFinalData = [];
    return {
        template,
        props: {
            // 已选校验器
            multipleSelection: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    application: this.getI18nByKey('application'),
                    nameI18nJson: this.getI18nByKey('nameI18nJson'),
                    businessName: this.getI18nByKey('businessName'),
                    name: this.getI18nByKey('name'),
                    appName: this.getI18nByKey('appName'),
                    typeName: this.getI18nByKey('typeName'),
                    icon: this.getI18nByKey('icon'),
                    sselectIcon: this.getI18nByKey('sselectIcon'),
                    IconTips: this.getI18nByKey('IconTips'),
                    enabled: this.getI18nByKey('enabled'),
                    descriptionI18nJson: this.getI18nByKey('descriptionI18nJson'),
                    increase: this.getI18nByKey('increase'),
                    pName: this.getI18nByKey('pName')
                },
                loading: false,
                shortName: '',
                appName: '',
                searchKey: '',
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                tableData: []
            };
        },
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            CheckerTree: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/components/CheckerTree/index.js'))
        },
        watch: {
            shortName(nv) {
                this.$emit('short-name', nv);
                nv && this.getsValidatorsList();
            },
            multipleSelection: {
                handler: function () {
                    obtainFinalData = [];
                    this.searchKeyChange();
                },
                deep: true
            }
        },
        computed: {
            // 校验器列表列头
            column() {
                return [
                    {
                        prop: '',
                        type: 'checkbox',
                        width: '40',
                        align: 'center'
                    },
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'beanName', // 列数据字段key
                        title: this.i18nMappingObj.name, // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'displayName', // 列数据字段key
                        title: this.i18nMappingObj.nameI18nJson, // 列头部标题
                        minWidth: '160' // 列宽度
                    },
                    {
                        prop: 'displayDesc', // 列数据字段key
                        title: '描述', // 列头部标题
                        minWidth: '160' // 列宽度
                    },
                    {
                        prop: 'typeName', // 列数据字段key
                        title: '类型', // 列头部标题
                        minWidth: '120' // 列宽度
                    }
                ];
            }
        },
        methods: {
            // obtainFinalData
            obtainFinalData() {
                return obtainFinalData;
            },
            // 表格选中行
            selectionChange() {
                obtainFinalData = this.getMultipleSelection() || [];
            },
            // 获取当前勾选数据
            getMultipleSelection() {
                let multipleSelection = this.$refs?.erdTable?.$refs?.xTable.getCheckboxRecords() || [];
                return multipleSelection.filter((item) => {
                    return !item._hideCheckbox;
                });
            },
            // 表格搜索
            searchKeyChange() {
                this.pagination.pageIndex = 1;
                this.pagination.pageSize = 20;
                this.pagination.total = 0;
                this.getsValidatorsList();
            },
            // 获取校验器列表
            getsValidatorsList() {
                this.loading = true;
                let url = `${this.shortName}/menu/filters`;
                let data = {
                    pageIndex: this.pagination.pageIndex,
                    pageSize: this.pagination.pageSize,
                    searchKey: this.searchKey
                };
                this.$famHttp({
                    url,
                    data,
                    method: 'post'
                })
                    .then((resp) => {
                        if (resp.success) {
                            let { data } = resp || {};
                            this.pagination.pageIndex = data.pageIndex || 1;
                            this.pagination.pageSize = data.pageSize || 20;
                            this.pagination.total = +data.total || 0;
                            // this.initSelectedData(data?.records || []);
                            this.tableData = data?.records || [];
                        }
                    })
                    .catch(() => {})
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 表格初始化选中数据
            initSelectedData(tableData) {
                for (let i = 0; i < this.multipleSelection.length; i++) {
                    let item = this.multipleSelection[i];
                    for (let j = tableData.length - 1; j >= 0; j--) {
                        let sitem = tableData[j];
                        if (item.filterName === sitem.beanName) {
                            tableData.splice(j, 1);
                        }
                    }
                }
                this.tableData = tableData;
            },
            // 点击树
            onNodeClick(treeItem) {
                this.appName = treeItem.appName;
                this.shortName = treeItem?.shortName || '';
            },
            handlePageChange() {
                this.getsValidatorsList();
            },
            handleSizeChange() {
                this.getsValidatorsList();
            }
        }
    };
});
