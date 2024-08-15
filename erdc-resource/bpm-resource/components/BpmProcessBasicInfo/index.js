define([
    'text!' + ELMP.resource('bpm-resource/components/BpmProcessBasicInfo/index.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmProcessBasicInfo/style.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');

    return {
        template,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            FamDict: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDict/index.js'))
        },
        props: {
            basicInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            processVariables: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            processStatus: String,
            isSecret: Boolean,
            readonly: Boolean,
            processInstanceOId: String,
            isProcessSecurityReadonly: Boolean
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmProcessBasicInfo/locale/index.js'),
                form: {
                    processName: '',
                    description: ''
                },
                layoutAttribute: []
            };
        },
        computed: {
            formId() {
                return this.readonly ? 'DETAIL' : 'CREATE';
            },
            className() {
                return this.$store.getters.className('processInstance');
            },
            queryLayoutParams() {
                return this.isSecret
                    ? {
                          name: this.readonly ? 'DETAIL_SecurityLabel' : 'CREATE_SecurityLabel',
                          objectOid: this.readonly ? this.processInstanceOId : undefined
                      }
                    : {
                          name: this.readonly ? 'DETAIL' : 'CREATE',
                          objectOid: this.readonly ? this.processInstanceOId : undefined
                      };
            },
            schemaMapper() {
                const _this = this;
                return {
                    securityLabel(schema) {
                        schema.readonly = _this.isProcessSecurityReadonly;
                    }
                };
            },
            validators() {
                return {
                    processName: [
                        {
                            trigger: ['input', 'blur'],
                            required: true,
                            message: this.i18n.keyRuleTips
                        }
                    ]
                };
            }
        },
        watch: {
            basicInfos: {
                immediate: true,
                handler(val) {
                    if (!_.isEmpty(val)) {
                        this.form = ErdcKit.deepClone(val);
                    }
                }
            },
            'form.securityLabel': {
                handler(val) {
                    this.$emit('get-security-label', val);
                }
            }
        },
        methods: {
            getLayoutAttribute(attribute) {
                this.layoutAttribute = attribute;
            },
            validate() {
                return new Promise((resolve) => {
                    this.$refs.form
                        .submit()
                        .then(({ valid }) => {
                            resolve({ valid, data: this.getData() });
                        })
                        .catch(({ valid }) => {
                            resolve({ valid, message: this.i18n.enterRequired });
                        });
                });
            },
            getData() {
                const data = {};
                _.each(this.layoutAttribute, (key) => {
                    data[key] = this.form[key];
                });
                return data;
            }
        }
    };
});
