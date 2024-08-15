define(['text!' + ELMP.resource('erdc-components/FamCodeGenerator/index.html')], (template) => {
    const FamKit = require('fam:kit');
    return {
        name: 'FamCodeGenerator',
        template,
        components: {
            SignatrueForm: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/SignatrueForm/index.js'))
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'system'
            },
            // 类型id
            typeId: {
                type: String,
                default: ''
            },
            popperClass: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamCodeGenerator/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    systemDefault: this.getI18nByKey('systemDefault'),
                    generatedCode: this.getI18nByKey('generatedCode'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    selectType: this.getI18nByKey('selectType'),
                    encodingrules: this.getI18nByKey('encodingrules')
                },
                visible: false,
                codeRuleData: {},
                codeRuleDefault: null,
                code: ''
            };
        },
        computed: {
            defaultValue: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            customClass() {
                return this.popperClass || '';
            }
        },
        watch: {
            typeId: {
                immediate: true,
                handler(typeId) {
                    if (typeId && this.type === 'autoGeneration') {
                        this.autoCode(typeId);
                    }
                }
            }
        },
        methods: {
            onInput(value) {
                this.$emit('input', value);
            },
            onCreate() {
                if (!this.typeId) {
                    return this.$message({
                        type: 'tips',
                        message: this.i18nMappingObj.selectType,
                        showClose: true
                    });
                }
                this.$famHttp({
                    url: '/fam/code/getCodeRuleByTypeId',
                    data: {
                        typeId: this.typeId
                    },
                    methods: 'GET'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.codeRuleData = data;
                        if (!this.codeRuleData) {
                            return this.$message({
                                type: 'tips',
                                message: this.i18nMappingObj.encodingrules,
                                showClose: true
                            });
                        }
                        this.visible = true;
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    });
            },
            onClose() {
                this.visible = false;
            },
            onSubmit() {
                this.$refs.signatrueForm.submit().then((data) => {
                    this.$famHttp({
                        url: '/fam/code/getCode',
                        data: {
                            ruleCode: this.codeRuleData?.code,
                            valueMap: data
                        },
                        method: 'POST'
                    })
                        .then((resp) => {
                            this.defaultValue = resp?.data || '';
                            this.codeRuleDefault = data;
                            this.onClose();
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || error,
                            //     showClose: true
                            // });
                        });
                });
            },
            autoCode(type) {
                this.$famHttp({
                    url: '/fam/code/getCodeByTypeName',
                    method: 'POST',
                    data: {
                        size: 1,
                        typeName: type,
                        valueMap: {}
                    }
                }).then(({ data = [] }) => {
                    this.code = data[0];
                });
            }
        }
    };
});
