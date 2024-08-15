define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageSignRule/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageSignRule/style.css'),
    'erdcloud.kit',
    'underscore',
    'erdc-kit'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const FamUtils = require('erdc-kit');

    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPullDown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamRuleEngine: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamRuleEngine/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            oid: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageSignRule/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'enter',
                    'create',
                    'signatureName',
                    'signatureInternalName',
                    'version',
                    'signatureType',
                    'mappableUnit',
                    'operation',
                    'confirm',
                    'clearConditions',
                    'cancel',
                    'selectTemplate',
                    'configureRule',
                    'updateSuccess',
                    'addSuccess',
                    'templateType',
                    'fileType',
                    'templateName',
                    'deleteConfirm',
                    'deleteConfirmDocTmplTips',
                    'removeSuccessfully',
                    'cannotMoveUp',
                    'cannotMoveDown',
                    'upSuccess',
                    'downSuccess',
                    'upFailed',
                    'downFailed'
                ]),
                searchValue: '',
                tableData: [],
                tableDataCopy: [],
                signatureRuleVisible: false,
                unfold: {
                    selectTemplate: true,
                    configureRule: true
                },
                loading: false,
                formData: {},
                rowData: {},
                className: 'erd.cloud.foundation.type.entity.ConstantDefinition',
                isUpdate: false,
                ruleConditionDtoList: [],
                templateNameList: [],
                templateVersionList: [],
                editLoading: false
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj.signatureName
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18nMappingObj.signatureInternalName
                    },
                    {
                        prop: 'versionStr',
                        title: this.i18nMappingObj.version
                    },
                    {
                        prop: 'fileType',
                        title: this.i18nMappingObj.signatureType
                    },
                    {
                        prop: 'mappableUnit',
                        title: this.i18nMappingObj.mappableUnit
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj.operation,
                        fixed: 'right'
                    }
                ];
            },
            formConfig() {
                return [
                    {
                        field: 'tmplType',
                        component: 'fam-dict',
                        label: this.i18nMappingObj.templateType,
                        required: true,
                        readonly: this.isUpdate,
                        props: {
                            itemName: 'signatureClassify',
                            dataType: 'string'
                        },
                        col: 24
                    },
                    {
                        field: 'fileType',
                        component: 'custom-select',
                        label: this.i18nMappingObj.fileType,
                        required: true,
                        readonly: this.isUpdate,
                        props: {
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的 label 的 key
                                valueProperty: 'value', // 显示 value 的 key
                                referenceList: [
                                    { label: 'PDF', value: 'PDF' },
                                    { label: 'WORD', value: 'WORD' },
                                    { label: 'EXCEL', value: 'EXCEL' }
                                ]
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'mappableUnit',
                        component: 'fam-dict',
                        label: this.i18nMappingObj.mappableUnit,
                        required: true,
                        readonly: this.isUpdate,
                        props: {
                            itemName: 'signatureMappableUnit',
                            dataType: 'string'
                        },
                        col: 24
                    },
                    {
                        field: 'templateName',
                        component: 'custom-select',
                        label: this.i18nMappingObj.templateName,
                        required: true,
                        readonly: this.isUpdate,
                        props: {
                            clearable: false,
                            placeholderLangKey: 'placeEnter',
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'id', // 显示value的key
                                referenceList: this.templateNameList
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'version',
                        component: 'custom-select',
                        label: this.i18nMappingObj.version,
                        required: true,
                        readonly: this.isUpdate,
                        props: {
                            clearable: false,
                            placeholderLangKey: 'placeEnter',
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'version', // 显示的label的key
                                valueProperty: 'vid', // 显示value的key
                                referenceList: this.templateVersionList
                            }
                        },
                        col: 24
                    }
                ];
            },
            isTemplateNameChange() {
                const { fileType, tmplType, mappableUnit } = this.formData;
                return fileType + tmplType + mappableUnit;
            },
            isTemplateVersionChange() {
                return this.isTemplateNameChange + this.formData.templateName;
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(oid) {
                    oid && this.getRelationData(oid);
                }
            },
            isTemplateNameChange() {
                const { fileType, tmplType, mappableUnit } = this.formData;
                if (fileType && tmplType && mappableUnit) {
                    this.getTemplateName();
                }
            },
            isTemplateVersionChange() {
                const { fileType, tmplType, mappableUnit, templateName } = this.formData;
                if (fileType && tmplType && mappableUnit && templateName) {
                    this.getTemplateVersion();
                }
            }
        },
        methods: {
            // 获取关联列表
            getRelationData(oid) {
                this.$famHttp({
                    url: `/doc/signature/v1/tmpl/signature/${oid}`,
                    params: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    },
                    method: 'get'
                }).then((resp) => {
                    this.tableData = resp?.data || [];
                    this.tableDataCopy = ErdcKit.deepClone(this.tableData);
                });
            },
            // 模糊查询
            search(val) {
                FamUtils.debounceFn(() => {
                    this.filterColumns(val);
                }, 300);
            },
            // 过滤数据
            filterColumns(val) {
                if (!val) {
                    return (this.tableData = ErdcKit.deepClone(this.tableDataCopy));
                }
                const searchKey = val.replace(/\s/gi, '');
                const searchData = _.filter(this.tableDataCopy, ({ name,
                    identifierNo,
                    versionStr,
                    fileType,
                    mappableUnit }) => {
                    return [name,
                        identifierNo,
                        versionStr,
                        fileType,
                        mappableUnit].some((field) => field?.includes(searchKey))
                }
                );
                this.tableData = ErdcKit.deepClone(searchData);
            },
            /**
             * 操作
             * type
             * 1-创建子菜单 一二级主菜单有 三级不可再创建
             * 2-编辑
             * 3-删除
             * **/
            getActionConfig(data) {
                return {
                    name: 'TYPE_SIGN_RULE_MORE',
                    className: 'erd.cloud.signature.entity.SignatureTmpl',
                    objectOid: data.oid
                };
            },
            // 操作按钮
            onCommand(type, row) {
                const eventClick = {
                    TYPE_SIGN_RULE_UP: this.onMoveUp,
                    TYPE_SIGN_RULE_DOWN: this.onMoveDown,
                    TYPE_SIGN_RULE_UPDATE: this.onUpdate,
                    TYPE_SIGN_RULE_DELETE: this.onDelete
                };
                _.isFunction(eventClick[type.name]) && eventClick[type.name](row);
            },
            // 获取模板名称
            getTemplateName() {
                if (this.isUpdate) return;
                const { fileType, tmplType, mappableUnit } = this.formData;
                const className = 'erd.cloud.signature.entity.SignatureTmplMaster';
                this.$set(this.formData, 'templateName', '');
                this.$set(this.formData, 'version', '');
                this.$famHttp({
                    url: '/doc/search',
                    method: 'post',
                    data: {
                        className,
                        conditionDtoList: [
                            {
                                attrName: `${className}#fileType`,
                                oper: 'EQ',
                                value1: fileType
                            },
                            {
                                attrName: `${className}#tmplType`,
                                oper: 'EQ',
                                value1: tmplType
                            },
                            {
                                attrName: `${className}#mappableUnit`,
                                oper: 'EQ',
                                value1: mappableUnit
                            }
                        ]
                    }
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return (this.templateNameList = []);
                        }
                        this.templateNameList = _.map(resp.data.records, (i) =>
                            ErdcKit.deserializeArray(i.attrRawList)
                        );
                    })
                    .catch(() => {
                        this.templateNameList = [];
                    });
            },
            // 获取模板版本号
            getTemplateVersion() {
                if (this.isUpdate) return;
                const { templateName } = this.formData;
                const className = 'erd.cloud.signature.entity.SignatureTmpl';
                this.$set(this.formData, 'version', '');
                this.$famHttp({
                    url: '/doc/search',
                    method: 'post',
                    data: {
                        className,
                        lastestVersion: false,
                        conditionDtoList: [
                            {
                                attrName: `${className}#masterRef`,
                                oper: 'EQ',
                                value1: templateName
                            },
                            {
                                attrName: `${className}#lifecycleStatus.status`,
                                oper: 'EQ',
                                value1: 'RELEASED'
                            },
                            {
                                attrName: `${className}#iterationInfo.state`,
                                oper: 'EQ',
                                value1: 'CHECKED_IN'
                            },
                            {
                                attrName: `${className}#iterationInfo.latest`,
                                oper: 'EQ',
                                value1: true
                            }
                        ]
                    }
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return (this.templateVersionList = []);
                        }
                        this.templateVersionList = _.map(resp.data.records, (i) =>
                            ErdcKit.deserializeArray(i.attrRawList)
                        );
                    })
                    .catch(() => {
                        this.templateVersionList = [];
                    });
            },
            // 创建签名规则
            onCreate() {
                this.formData = {};
                this.rowData = {};
                this.isUpdate = false;
                this.signatureRuleVisible = true;
            },
            // 更新签名规则
            onUpdate(row) {
                const { tmplType, fileType, mappableUnit, id, vid, name, versionStr } = row;
                this.rowData = row;
                this.formData = {
                    tmplType,
                    fileType,
                    mappableUnit,
                    templateName: id,
                    version: vid
                };
                this.templateNameList = [{ name, id }];
                this.templateVersionList = [{ version: versionStr, vid }];
                this.editLoading = true;
                this.$famHttp({
                    url: `/fam/type/typeDefinition/find/constant/${row.constantDefinitionRef}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.ruleConditionDtoList = resp.data.ruleConditionDtoList || [];
                        }
                    })
                    .finally(() => {
                        this.editLoading = false;
                    });
                this.isUpdate = true;
                this.signatureRuleVisible = true;
            },
            // 删除签名规则
            onDelete(row) {
                this.$confirm(this.i18nMappingObj.deleteConfirmDocTmplTips, this.i18nMappingObj.deleteConfirm, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        method: 'DELETE',
                        params: {
                            oid: row.constantDefinitionRef
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj.removeSuccessfully);
                            this.getRelationData(this.oid);
                        }
                    });
                });
            },
            // 上移
            onMoveUp(row) {
                let index = -1;
                for (let i = 0; i < this.tableData.length; i++) {
                    if (this.tableData[i].oid === row.oid) {
                        index = i;
                        break;
                    }
                }
                if (index === -1 || index === 0) {
                    return this.$message.warning(this.i18nMappingObj.cannotMoveUp);
                }
                this.tableData.splice(index, 1);
                this.tableData.splice(index - 1, 0, row);
                this.onMove(
                    _.map(this.tableData, (i) => i.constantDefinitionRef),
                    'UP'
                );
            },
            // 下移
            onMoveDown(row) {
                let index = -1;
                for (let i = 0; i < this.tableData.length; i++) {
                    if (this.tableData[i].oid === row.oid) {
                        index = i;
                        break;
                    }
                }
                if (index === -1 || index === this.tableData.length - 1) {
                    return this.$message.warning(this.i18nMappingObj.cannotMoveDown);
                }
                this.tableData.splice(index, 1);
                this.tableData.splice(index + 1, 0, row);
                this.onMove(
                    _.map(this.tableData, (i) => i.constantDefinitionRef),
                    'DOWN'
                );
            },
            // 排序请求
            onMove(data, moveStep) {
                this.$famHttp({
                    url: `/fam/sort`,
                    method: 'POST',
                    data
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message:
                                moveStep === 'UP' ? this.i18nMappingObj.upSuccess : this.i18nMappingObj.downSuccess,
                            showClose: true
                        });
                    })
                    .finally(() => {
                        this.getRelationData(this.oid);
                    });
            },
            // 确认提交签名规则
            async submit() {
                const { dynamicForm, famRuleEngine } = this.$refs;
                const formData = await dynamicForm.submit();
                if (!formData?.valid) return;
                const conditionsList = famRuleEngine.getRuleEngineParams();
                const holderRef = 'O' + formData.data.version.substring(1);
                const data = {
                    attrRawList: [
                        {
                            attrName: 'name',
                            value: 'sign'
                        },
                        {
                            attrName: 'holderRef',
                            value: holderRef
                        },
                        {
                            attrName: 'typeReference',
                            value: this.oid
                        },
                        {
                            attrName: 'sortOrder',
                            value: 0
                        }
                    ],
                    className: this.className,
                    associationField: 'holderRef',
                    relationList: conditionsList
                };
                if (this.isUpdate && this.rowData?.constantDefinitionRef) {
                    data.oid = this.rowData.constantDefinitionRef;
                }
                this.$famHttp({
                    url: `/fam/${this.isUpdate ? 'update' : 'create'}`,
                    method: 'post',
                    data
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return this.$message.error(resp.message);
                        }
                        this.$message.success(this.i18nMappingObj[this.isUpdate ? 'updateSuccess' : 'addSuccess']);
                        this.signatureRuleVisible = false;
                        this.getRelationData(this.oid);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 清空配置规则
            clearAllConditions() {
                this.$refs.famRuleEngine.clearAllConditions();
            },
            /**
             * 对象数组去重
             * @param objectArray
             * @param key 对象去重字段
             * @returns {Array}
             */
            objectArrayRemoveDuplication(objectArray, key) {
                const has = {};
                objectArray = objectArray.reduce((pre, next) => {
                    if (!has[next[key]]) {
                        has[next[key]] = true;
                        pre.push(next);
                    }
                    return pre;
                }, []);
                return objectArray;
            }
        }
    };
});
