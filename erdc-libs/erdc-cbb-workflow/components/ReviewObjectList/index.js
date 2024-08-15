define([
    'text!' + ELMP.resource('erdc-cbb-workflow/components/ReviewObjectList/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ReviewObjectList',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js'))
        },
        props: {
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            tableData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 隐藏按钮组
            hideOper: Boolean,
            // 隐藏添加按钮
            hideAppend: Boolean,
            // 隐藏收集按钮
            hideCollect: Boolean,
            // 隐藏移除按钮
            hideRemove: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-workflow/components/ReviewObjectList/locale/index.js'),
                // 选中数据
                selectedData: [],
                // 表格数据
                innerTable: [],
                // 增加对象
                objectForm: {
                    visible: false,
                    urlConfig: (vm) => {
                        const row = {
                            attrName: `${vm.className}#iterationInfo.state`,
                            oper: 'NOT_IN',
                            value1: 'WORKING,CHECKED_OUT'
                        }
                        const data = ErdcKit.deepClone(vm?.defaultUrlConfig?.data) || {};
                        data.conditionDtoList.push(row);
                        return {
                            data: {
                                ...data
                            }
                        };
                    }
                },
                // 收集对象
                collectForm: {
                    visible: false,
                    title: '',
                    className: '',
                    tableData: []
                }
            };
        },
        watch: {
            tableData: {
                handler: function (nv) {
                    this.innerTable = ErdcKit.deepClone(nv) || [];
                },
                immediate: true
            },
            innerTable: {
                handler: function (nv) {
                    if (nv.length) {
                        let typeName = '',
                            [obj] = nv;
                        const typeNameInfo =
                            _.find(obj?.attrRawList, (item) => new RegExp('typeName$').test(item?.attrName)) || {};
                        if (!_.isEmpty(typeNameInfo) && typeNameInfo?.value) {
                            typeName = typeNameInfo?.value;
                        }
                        if (obj?.versionOid) {
                            typeName = obj?.versionOid?.split(':')[1] || '';
                        }
                        this.collectForm.className = typeName;
                    }
                },
                immediate: true
            }
        },
        methods: {
            collectObjectClick() {
                const tableData = this.$refs?.collectObjectsRef?.getData?.();
                const next = () => {
                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            // 清空所选数据
                            this.checkboxAll({ records: [] });
                        }
                    });
                };

                this.$emit('collect-review-object', { tableData, next });
            },
            // 收集相关对象
            collectReviewObject() {
                if (!this.selectedData.length) {
                    return this.$message.info(this.i18n['请先选择要收集的评审对象']);
                }
                this.popover({
                    field: 'collectForm',
                    visible: true,
                    title: this.i18n['收集相关对象'],
                    callback: () => {
                        this.collectForm.tableData = ErdcKit.deepClone(this.selectedData) || [];
                    }
                });
            },
            // 添加评审对象
            addReviewObject() {
                this.$nextTick(() => {
                    this.popover({ field: 'objectForm', visible: true });
                });
            },
            // 增加对象提交前处理
            beforeSubmit(data, newNext) {
                const next = () => {
                    // 清空所选数据
                    this.checkboxAll({ records: [] });
                    _.isFunction(newNext) && newNext();
                };
                this.$emit('add-review-object', { tableData: data, next });
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            // 移除评审对象
            removeReviewObject() {
                this.$emit('remove-review-object', {
                    tableData: ErdcKit.deepClone(this.selectedData),
                    next: () => {
                        // 清空所选数据
                        this.checkboxAll({ records: [] });
                    }
                });
            },
            // 复选框选中单条数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框选中全部数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            // 获取评审对象数据
            getData() {
                return ErdcKit.deepClone(this.innerTable) || [];
            }
        }
    };
});
