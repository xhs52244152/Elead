define([
    'text!' + ELMP.resource('biz-bpm/process-template/CopyProcessTemplate/index.html')
], function (template) {
    const _ = require('underscore'), NAME_REG = /^[a-zA-Z$_][0-9a-zA-Z$_-]*$/;
    return {
        name: 'CopyProcessTemplate',
        template,
        props: {
            // 是否只读
            readonly: {
                type: Boolean,
                default: false
            },
            category: String,
            appName: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['组件提示', '流程模板', '新模板名称', '新模板标识', '新模板标识规则']),
                formDetails: {
                    sourceProcessOid: '',
                    newModelKey: '',
                    newModelName: ''
                },
                templateList: []
            }
        },
        computed: {
            // 按钮组合表单数据
            fromList() {
                return [
                    {
                        field: 'sourceProcessOid',
                        component: 'custom-select',
                        label: this.i18nMappingObj['流程模板'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示']) ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['流程模板']) : '',
                            multiple: false,
                            filterable: true,
                            row: {
                                filterable: true,
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'oid', // 显示value的key
                                referenceList: this.templateList,
                                clearNoData: true, // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'newModelName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['新模板名称'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 30,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示']) ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['新模板名称']) : ''
                        },
                        col: 24
                    },
                    {
                        field: 'newModelKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['新模板标识'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        validators: [
                            { pattern: NAME_REG, message: this.i18nMappingObj['新模板标识规则'], trigger: 'blur' }
                        ],
                        props: {
                            maxlength: 20,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示']) ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['新模板标识']) : ''
                        },
                        col: 24
                    }
                ];
            }
        },
        watch: {
            category: {
                handler: function () {
                    this.loadTemplateList();
                },
                immediate: true
            },
            'formDetails.sourceProcessOid'(oid) {
                if (oid) {
                    let item = _.find(this.templateList, { oid }) || {};
                    if (item) {
                        let { name, engineModelKey } = item || {};
                        this.formDetails.newModelName = name + '_Copy' || this.formDetails.newModelName;
                        this.formDetails.newModelKey = engineModelKey ? engineModelKey + '_Copy' : this.formDetails.newModelKey;
                    }
                }
            }
        },
        methods: {
            // 查询流程模板
            loadTemplateList() {
                this.$famHttp({
                    url: '/bpm/search',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        appNames: _.compact([this.appName]),
                        className: `${this.$store.getters.className('processDef')}`,
                        conditionDtoList: [
                            {
                                attrName: `${this.$store.getters.className('processDef')}#iterationInfo.state`,
                                oper: 'EQ',
                                value1: 'CHECKED_IN'
                            },
                            {
                                attrName: "erd.cloud.bpm.process.entity.ProcessDef#categoryRef",
                                oper: "EQ",
                                value1: this.category
                            }
                        ],
                        pageIndex: 1,
                        pageSize: 9999
                    }
                }).then(resp => {
                    let { success, data = {} } = resp || {};
                    if (success) {
                        let { records = [] } = data || {};
                        this.templateList = _.each(records, row => {
                            _.each(['name', 'engineModelId', 'engineModelKey'], property => {
                                let { value } = _.find(row.attrRawList, { attrName: property }) || {};
                                row[property] = value;
                            })
                        });
                    }
                })
            },
            submit() {
                const { dynamicForm } = this.$refs, { submit } = dynamicForm;
                return submit();
            },
            // 表单校验
            async submitCopy(callback) {
                const { dynamicForm } = this.$refs, { submit, serializeEditableAttr } = dynamicForm;
                submit().then(async res => {
                    if (res.valid) {
                        const form = serializeEditableAttr() || {};
                        res = await this.operInterfaceObj({ form });
                        if (res.success) {
                            setTimeout(() => {
                                callback({ valid: true });
                            }, 500)
                        }
                        this.$message.success('保存成功');
                    }
                    else {
                        callback({ valid: false });
                    }
                }).catch(err => {
                    let { data } = err;
                    if (data.success === false) {
                        this.$message.error(data.message);
                        err.valid = data.success;
                    }
                    callback({ valid: err.valid });
                });
            }
        }
    }
});
