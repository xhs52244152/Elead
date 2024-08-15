define([
    'text!' + ELMP.resource('biz-code-rule/components/CodeRuleTable/index.html'),
    'css!' + ELMP.resource('biz-code-rule/components/CodeRuleTable/index.css')
], (template) => {
    const FamKit = require('fam:kit');

    return {
        name: 'CodeRuleTable',
        template,
        components: {
            FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            CodeRuleForm: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/CodeRuleForm/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamImport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        props: {},
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                containerOid: this.$store.state.space?.context?.oid || '',
                visibleValue: false,
                visibleValue2: false,
                oid: '',
                ruleLoading: false,
                serialCodeLoading: false,
                nowSerialCode: '1',
                serialCode: '',
                tableData: [],
                formData: {
                    nowSerialCode: '1',
                    serialCode: ''
                },
                serialCodeReg: null,
                featureCode: '',
                ruleCodeOid: '',
                importVisible: false,
                exportVisible: false,
                importRequestConfig: {},
                exportRequestConfig: {},
                appName: null
            };
        },
        computed: {
            title() {
                return this.oid ? this.i18n.editCodeRule : this.i18n.createCodeRules;
            },
            viewTableConfig() {
                return {
                    tableKey: 'codeRuleViewTable', // UserViewTable productViewTable
                    viewTableTitle: this.i18n.codeRuleManagement,
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            tableConfig() {
                let tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        // url: '/fam/search', // 表格数据接口
                        data: {
                            className: this.$store.getters.className('codeRule'),
                            orderBy: 'createTime',
                            sortBy: 'desc'
                        }, // 路径参数
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    const { records } = resData?.data || {};
                                    resData.data.records = records.map((item) => {
                                        const obj = {};
                                        item.attrRawList.forEach((ite) => {
                                            obj[ite.attrName] = ite.displayName;
                                            const attr = ite.attrName.split('#')[1];
                                            obj[attr] = ite.value;
                                            if (_.isObject(ite.value)) {
                                                obj[ite.attrName] = ite.displayName;
                                                obj[attr] = ite.displayName;
                                            }
                                            if (attr === 'patternDesc') {
                                                obj[ite.attrName] = ite.value;
                                                obj[attr] = ite.value;
                                            }
                                        });
                                        return {
                                            ...item,
                                            ...obj
                                        };
                                    });
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    tableRequestDataConfig: 'records', // 获取表格接口请求回来数据的字段名称
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        method: 'POST',
                        data: { className: this.$store.getters.className('codeRule') }
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        fuzzySearch: {
                            show: false, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18n.enterNameOrCode, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '320',
                            isLocalSearch: false, // 使用前端搜索
                            searchCondition: [`${this.$store.getters.className('codeRule')}#name`]
                        },
                        actionConfig: {
                            name: 'CODERULE_GROUP_CREATE'
                        },
                        basicFilter: {
                            show: true,
                            maxLength: 4
                        }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            // 超链接事件
                            this.onDetail(row);
                        }
                    },
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default' // 显示字段内容插槽
                        },
                        {
                            prop: `${this.$store.getters.className('codeRule')}#name`,
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('codeRule')}#code`,
                            type: 'default'
                        }
                    ],
                    pagination: {
                        showPagination: true
                    }
                };
                return tableConfig;
            },
            formConfig() {
                return [
                    {
                        field: 'nowSerialCode',
                        component: 'erd-input',
                        label: this.i18n.currentSequenceChars,
                        readonly: true,
                        col: 24
                    },
                    {
                        field: 'serialCode',
                        component: 'erd-input',
                        label: this.i18n.sequenceChars,
                        limits: this.serialCodeReg,
                        col: 24
                    }
                ];
            },
            nameSlot() {
                return `column:default:${this.$store.getters.className('codeRule')}#name:content`;
            },
            codeSlot() {
                return `column:default:${this.$store.getters.className('codeRule')}#code:content`
            }
        },
        methods: {
            // 刷新表格方法
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')();
            },
            actionClick(value) {
                switch (value.name) {
                    case 'CODE_RULE_CREATE':
                        this.onCreate();
                        break;
                    case 'CODE_RULE_IMPORT':
                        this.onImport();
                        break;
                    case 'CODE_RULE_EXPORT':
                        this.onExport();
                        break;
                    default:
                        break;
                }
            },
            // 创建编码规则
            onCreate() {
                this.oid = '';
                this.visibleValue = true;
            },
            // 编辑编码规则
            onEdit(data) {
                this.oid = data.oid;
                this.visibleValue = true;
            },
            // 设置最大流水码
            onSetMaxCode(data) {
                this.formData.nowSerialCode = '1';
                this.visibleValue2 = true;
                this.featureCode = data.id;
                this.ruleCodeOid = data.oid;
                this.serialCodeReg = new RegExp('[^' + data.sequenceChars + ']', 'g');
                this.$famHttp({
                    url: '/fam/search',
                    data: {
                        className: this.$store.getters.className('codeMaxSerial'),
                        conditionDtoList: [
                            {
                                oper: 'EQ',
                                attrName: 'ruleRef',
                                value1: data.oid
                            }
                        ]
                    },
                    method: 'POST'
                }).then((resp) => {
                    const { records } = resp?.data || {};
                    this.tableData = records.map((item) => {
                        const obj = {};
                        item.attrRawList.forEach((ite) => {
                            obj[ite.attrName] = ite.value;
                            // if (_.isObject(ite.value)) {
                            //     obj[ite.attrName] = ite.displayName;
                            // }
                        });
                        return {
                            ...item,
                            ...obj
                        };
                    });
                    if (this.tableData.length) {
                        this.formData.nowSerialCode = this.tableData[0]?.serialCode || '1';
                    }
                });
            },
            // 关闭表单
            closeForm() {
                this.oid = '';
                this.visibleValue = false;
            },
            // 编码规则表单确认
            onSubmit() {
                this.ruleLoading = true;
                const { codeRuleForm } = this.$refs;
                codeRuleForm
                    .submit()
                    .then((attrRawList) => {
                        let data = {
                            className: this.$store.getters.className('codeRule'),
                            typeReference: 'OR:erd.cloud.foundation.type.entity.TypeDefinition:1562274619145490434',
                            attrRawList
                        };
                        let url = '/fam/create';
                        if (this.oid) {
                            data.oid = this.oid;
                            url = '/fam/update';
                        }
                        this.$famHttp({
                            url,
                            data,
                            method: 'POST'
                        })
                            .then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message: this.oid ? this.i18n.editSuccessfully : this.i18n.createSuccessfully,
                                    showClose: true
                                });
                                this.closeForm();
                                this.refreshTable();
                            })
                            .catch((error) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: error?.data?.message || error,
                                //     showClose: true
                                // });
                            })
                            .finally(() => {
                                this.ruleLoading = false;
                            });
                    })
                    .finally(() => {
                        this.ruleLoading = false;
                    });
            },
            onDelete(row) {
                this.$confirm(this.i18n.deleteCodeRule, this.i18n.confirmDeletion, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: {
                            oid: row.oid
                        },
                        method: 'DELETE'
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18n.deleteSuccess,
                                showClose: true
                            });
                            this.refreshTable();
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || '删除失败',
                            //     showClose: true
                            // });
                        });
                });
            },
            onDetail(data) {
                this.$emit('goto', 'signatureTable', data);
            },
            // 操作按钮配置
            getActionConfig(row) {
                return {
                    name: 'CODE_RULE_GROUP_MORE',
                    objectOid: row.oid
                };
            },
            onCommand(type, data) {
                const eventClick = {
                    CODE_RULE_EDIT: this.onEdit,
                    CODE_RULE_DELETE: this.onDelete,
                    CODE_RULE_DEL_SERIAL_CODE: this.onSetMaxCode
                };
                eventClick[type.name] && eventClick[type.name](data);
            },
            serialCodeSubmit() {
                this.serialCodeLoading = true;
                const { dynamicForm } = this.$refs;
                dynamicForm
                    .submit()
                    .then(({ valid }) => {
                        if (valid) {
                            const attrRawList = dynamicForm.serializeEditableAttr();
                            let url = '/fam/create';
                            let data = {
                                className: this.$store.getters.className('codeMaxSerial'),
                                attrRawList: [
                                    ...attrRawList,
                                    {
                                        attrName: 'featureCode',
                                        value: this.featureCode
                                    },
                                    {
                                        attrName: 'ruleRef',
                                        value: this.ruleCodeOid
                                    }
                                ]
                            };
                            const length = this.tableData.length;
                            if (length) {
                                url = '/fam/update';
                                data.oid = this.tableData[0].oid;
                                data.attrRawList = attrRawList;
                            }

                            this.$famHttp({
                                url,
                                data,
                                method: 'POST'
                            })
                                .then((resp) => {
                                    this.$message({
                                        type: 'success',
                                        message: this.i18n.sequenceCharsSetSuccessfully,
                                        showClose: true
                                    });
                                    this.visibleValue2 = false;
                                    this.$set(this.formData, 'serialCode', '');
                                })
                                .catch((error) => {
                                    // this.$message({
                                    //     type: 'error',
                                    //     message: error?.data?.message || error,
                                    //     showClose: true
                                    // });
                                })
                                .finally(() => {
                                    this.serialCodeLoading = false;
                                });
                        }
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || error,
                            showClose: true
                        });
                    })
                    .finally(() => {
                        this.serialCodeLoading = false;
                    });
            },
            onImport() {
                this.importRequestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('codeRule')
                        },
                        customParams: {
                            appName: this.appName || ''
                        }
                    }
                };
                this.importVisible = true;
            },
            onExport() {
                const requestConfig = this.$refs.famViewTable.getTableInstance('advancedTable', 'instance')?.fnGetRequestConfig();
                this.exportRequestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('codeRule'),
                            conditionDtoList: requestConfig?.data?.conditionDtoList || []
                        },
                        customParams: {
                            appName: this.appName || ''
                        }
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.reloadTree();
            },
            basicFilterChange(condition) {
                const appNameFilter = condition.find((item) => {
                    return item.attrName.includes('appName');
                });
                if (!_.isEmpty(appNameFilter)) {
                    this.appName = appNameFilter.value1 || null;
                }
            }
        }
    };
});
