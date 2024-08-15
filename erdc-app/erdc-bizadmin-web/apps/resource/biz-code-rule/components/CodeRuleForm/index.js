define([
    'text!' + ELMP.resource('biz-code-rule/components/CodeRuleForm/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-code-rule/components/CodeRuleForm/style.css')
], (template, utils) => {
    const FamKit = require('fam:kit');

    return {
        name: 'CodeRuleForm',
        template,
        props: {
            appName: {
                type: String,
                default: ''
            },
            oid: {
                type: String,
                default: ''
            },
            typeOid: {
                type: String,
                default: ''
            }
        },
        components: {
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`)),
            FamMonacoEditor: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamMonacoEditor/index.js`)),
            SequenceChars: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/SequenceChars/index.js')),
            CodeRuleConfig: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/CodeRuleConfig/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                formData: {
                    ignoreChars: 'N|', // 流水码字符集
                    serialPolicyCode: '', // 流水码递增规则
                    typeLinkRef: '',
                    varDesc: '{}',
                    pattern: '',
                    featureScript: '{}'
                },
                className: this.$store.getters.className('codeRule'),
                visibleSequenceChars: false,
                visibleCustomVariablesBtn: false,
                options: {
                    language: 'json'
                },
                serialPolicyCodeData: [],
                typeLinkRefTreeData: [],
                treeProps: {
                    label: 'displayName',
                    children: 'children',
                    value: 'oid'
                },
                i18nComponent: [],
                customDataCopy: {},
                interfaceData: {},
                canBeUpdate: true,
                oldSerialPolicyCode: null
            };
        },
        watch: {
            'formData.serialPolicyCode': {
                handler(nv, ov) {
                    const serialPolicyCodes = ['MAX_BIT_INCREMENT', 'MIN_BIT_INCREMENT'];
                    const seqType = this.formData.ignoreChars.split('|')[0];
                    const seqChar = this.formData.ignoreChars.split('|')[1];
                    // 判断是否包含数字类型，并且包含所有数字
                    const nunmberReg = /[0-9]/g;
                    const isNumberAll = seqType.includes('N') && !nunmberReg.test(seqChar);
                    const isChar = seqType.includes('a') || seqType.includes('A');
                    if (serialPolicyCodes.includes(nv) && (!isChar || !isNumberAll)) {
                        this.$message({
                            type: 'warning',
                            message: this.i18n.sequenceCharsTips,
                            showClose: true
                        });
                        if (ov) {
                            this.formData.serialPolicyCode = ov;
                        }
                    }
                }
            },
            'formData.varDescType': {
                deep: true,
                handler(nv, ov) {
                    if (ov) {
                        this.customDataCopy[ov] = this.formData?.varDesc;
                        this.formData.varDesc = this.customDataCopy[nv] || '{}';
                    }
                }
            },
            'typeOid': {
                immediate: true,
                handler(nv) {
                    this.formData.typeLinkRef = nv;
                }
            }
        },
        computed: {
            formId() {
                return this.oid ? 'UPDATE' : 'CREATE';
                // return 'CREATE'
            },
            schemaMapper() {
                const _this = this;
                const formData = this.formData;
                const disabledArray = this.disabledAppNameArr;
                return {
                    appName: function (schema) {
                        schema.props.disabledArray = disabledArray;
                    },
                    name: function (schema) {
                        schema.props.trimValidator = true;
                    },
                    code: function (schema) {
                        schema.validators = [
                            ...schema.validators,
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (/[^a-zA-Z0-9._-]+/.test(value)) {
                                        callback(new Error(this.i18n.inputTips));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ];
                    },
                    // 流水码字符集
                    ignoreChars: function (schema) {
                        schema.readonly = !_this.canBeUpdate;
                    },
                    // 流水码递增规则
                    serialPolicyCode: function (schema) {
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 变量来源类型
                    varFromType: function (schema) {
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 关联对象插槽
                    typeLinkRef: function (schema) {
                        schema.hidden = formData.varFromType !== 'TYPE_ATTRIBUTE';
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 自定义来源 varDesc 插槽
                    varDesc: function (schema) {
                        schema.hidden = formData.varFromType !== 'CUSTOM';
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 变量说明类型
                    varDescType: function (schema) {
                        schema.hidden = formData.varFromType !== 'CUSTOM';
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 变量来源URL
                    varFromUrl: function (schema) {
                        schema.hidden = formData.varFromType !== 'INTERFACE';
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 静态获取变量说明
                    customVariablesBtn: function (schema) {
                        schema.hidden = formData.varFromType !== 'CUSTOM' || formData.varDescType !== '1';
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 变量说明来源URL
                    varDescUrl: function (schema) {
                        schema.hidden = formData.varFromType !== 'CUSTOM' || formData.varDescType !== '2';
                        schema.disabled = !_this.canBeUpdate;
                    },
                    // 变量说明来源URL
                    globalSequence: function (schema) {
                        schema.disabled = !_this.canBeUpdate;
                    }
                };
            },
            seqCharsMsg() {
                const map = {
                    N: this.i18n.number,
                    A: this.i18n.capitalLetter,
                    a: this.i18n.lowercaseLetter
                };
                const ignoreChars = (this.formData.ignoreChars || '').split('|');
                const supportChars = ignoreChars[0].split('');
                const shutOutChars = ignoreChars[1];
                const message = supportChars
                    .map((item) => {
                        return map[item];
                    })
                    .join(',');
                return `${this.i18n.support} ${message}。${shutOutChars ? this.i18n.exclude + ' ' + shutOutChars : ''}`;
            },
            customData() {
                return JSON.parse(this.formData?.varDesc || '{}');
            },
            featureScript() {
                return JSON.parse(this.formData?.featureScript || '{}');
            },
            storeAppNames() {
                return this.$store?.state?.app?.appNames || [];
            },
            disabledAppNameArr() {
                if (this.appName && this.appName !== 'plat') {
                    return this.storeAppNames
                        .filter((item) => item.identifierNo !== this.appName)
                        .map((item) => item.identifierNo);
                }
                return [];
            },
            row() {
                return {
                    components: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'identifierNo',
                    referenceList: []
                };
            }
        },
        mounted() {
            this.getDetails(this.oid);
            this.getSerialPolicyCode();
            this.getTypeReferenceTreeData();
        },
        methods: {
            resolveWidget(widget) {
                if (widget.schema.field === 'varFromType' && this.typeOid) {
                    widget.schema.disabled = true;
                }
                return widget;
            },
            getDetails(oid) {
                if (!oid) {
                    return;
                }
                this.$famHttp({
                    url: 'fam/attr',
                    params: {
                        oid
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.formData = FamKit.deserializeAttr(data.rawData, {
                            valueMap: {
                                typeLinkRef({ oid }) {
                                    return oid;
                                }
                            }
                        });
                        this.canBeUpdate = this.formData?.canBeUpdate ?? true;
                        this.handleAppNameChange(this.formData.appName);
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    });
            },
            getTypeReferenceTreeData: (function () {
                let currentAppName;
                return function (appName) {
                    if (currentAppName && currentAppName === appName) {
                        return;
                    }
                    currentAppName = appName;
                    this.$famHttp({
                        url: '/fam/type/typeDefinition/getNumberableType',
                        headers: {
                            'App-Name': appName
                        },
                        data: {
                            appName: appName || this.appName
                        }
                    }).then((resp) => {
                        const { data } = resp;
                        this.typeLinkRefTreeData = data.map((item) => {
                            delete item.parentId;
                            return item;
                        });
                    });
                };
            })(),
            // 获取流水码递增规则
            getSerialPolicyCode: (function () {
                let currentAppName;
                return function (appName) {
                    if (currentAppName && currentAppName === appName) {
                        return;
                    }
                    currentAppName = appName;
                    this.$famHttp({
                        url: '/fam/code/getSerialPolicy',
                        headers: {
                            'App-Name': appName
                        },
                        data: {
                            appName: appName || this.appName
                        }
                    }).then((resp) => {
                        const { data } = resp;
                        this.serialPolicyCodeData = data;
                        this.formData.serialPolicyCode = data[0]?.code || '';
                    });
                };
            })(),
            submit() {
                const { editForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            const varDescValid = JSON.parse(this.formData.patternDesc || '[]').find((item) => {
                                return item.key === 'SERIAL_NUM' && !item.value;
                            });
                            if (varDescValid) {
                                this.$message({
                                    type: 'error',
                                    message: this.i18n.inputFlowCode,
                                    showClose: true
                                });
                                reject();
                            }
                            if (valid) {
                                let attrRawList = editForm.serializeEditableAttr(undefined, undefined, true);
                                attrRawList.push({
                                    attrName: 'featureScript',
                                    value: this.formData.featureScript
                                });

                                // 需要去除前后空格的字段
                                const trimI18nJsonArr = ['name'];
                                attrRawList = attrRawList.map((item) => {
                                    let sitem = item;
                                    if (trimI18nJsonArr.includes(item.attrName)) {
                                        utils.trimI18nJson(sitem.value);
                                    }
                                    return sitem;
                                });
                                resolve(attrRawList);
                            } else {
                                reject();
                            }
                        })
                        .catch((error) => {
                            reject();
                        });
                });
            },
            setSequenceChars() {
                this.visibleSequenceChars = true;
            },
            sequenceSubmit() {
                this.$refs.ignoreChars.submit().then((data) => {
                    this.formData.ignoreChars = data;
                    this.visibleSequenceChars = false;
                });
            },
            // 设置变量说明按钮
            onCustomVariablesBtn() {
                this.visibleCustomVariablesBtn = true;
            },
            // 编码规则改变
            codeRuleChange(data) {
                this.formData.pattern = data;
            },
            // 变量配置改变
            featureScriptChange(data) {
                this.formData.featureScript = JSON.stringify(data);
            },
            // 编码规则配置改变
            codeRuleConfigChange(data) {
                this.formData.patternDesc = JSON.stringify(data);
            },
            // 自定义类型，动态获取变量说明
            onResetDesc(type) {
                let url = this.formData?.varFromUrl || '';
                if (type === 'desc') {
                    url = this.formData?.varDescUrl || '';
                }
                if (!url) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.enterInterfaceAddress
                    });
                }

                this.$famHttp({
                    url
                })
                    .then((resp) => {
                        const { data } = resp;
                        if (type === 'form') {
                            this.interfaceData = data.varDesc;
                            this.formData.featureScript = data.featureScript;
                        } else {
                            this.formData.varDesc = JSON.stringify(data || '{}');
                            this.formData.featureScript = data.featureScript;
                        }
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    });
            },
            // 自定义配置变量说明
            varDescFn() {
                try {
                    const value = this.$refs.famMonacoEditor.getValue();
                    let isArray = false;
                    const custom = function (obj) {
                        _.keys(obj).forEach((key) => {
                            if (_.isObject(obj[key])) {
                                custom(obj[key]);
                            }
                            if (_.isArray(obj[key])) {
                                isArray = true;
                            }
                        });
                    };
                    custom(JSON.parse(value || '{}'));
                    if (isArray) {
                        return this.$message({
                            type: 'warning',
                            message: this.i18n.customConfigTips,
                            showClose: true
                        });
                    }
                    this.formData.varDesc = value;
                    this.customVariablesClose();
                } catch {
                    this.$message({
                        type: 'error',
                        message: this.i18n.JSONFormatTips,
                        showClose: true
                    });
                }
            },
            // 关闭变量说明
            customVariablesClose() {
                this.visibleCustomVariablesBtn = false;
            },
            handleFieldChange({ field }, value) {
                if (field === 'appName') {
                    this.handleAppNameChange(value);
                }
            },
            handleAppNameChange(appName) {
                this.getSerialPolicyCode(appName);
                this.getTypeReferenceTreeData(appName);
            }
        }
    };
});
