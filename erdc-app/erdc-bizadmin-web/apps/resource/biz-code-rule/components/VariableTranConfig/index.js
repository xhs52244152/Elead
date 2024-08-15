define([
    'text!' + ELMP.resource('biz-code-rule/components/VariableTranConfig/index.html'),
    'css!' + ELMP.resource('biz-code-rule/components/VariableTranConfig/style.css')
], (template) => {
    const FamKit = require('fam:kit');
    return {
        name: 'VariableTranConfig',
        template,
        components: {
            VariableTran: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/VariableTran/index.js'))
        },
        props: {
            featureScript: {
                type: Object,
                default: {}
            },
            selectData: {
                type: Array,
                default: []
            },
            defaultVariable: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                formData: {
                    type: 'map',
                    content: '',
                    variable: ''
                },
                helpVisible: false,
                mapValue: '1|苹果' + '\n' + '2|橘子',
                javascriptValue:
                    '// value variable is fixed' +
                    '\n' +
                    "if(value == '1'){" +
                    '\n' +
                    "return '苹果';" +
                    '\n' +
                    "}else if(value == '2'){'" +
                    '\n' +
                    "return '橘子';" +
                    '\n' +
                    '}',
                variableData: [],
                featureScriptClone: null
            };
        },
        watch: {
            'formData.variable': {
                deep: true,
                immediate: true,
                handler(nv) {
                    const contentObj = this.featureScriptClone?.[nv]?.content || '';
                    let content = '';
                    _.keys(contentObj).forEach((key) => {
                        content += content ? '\n' + key + '|' + contentObj[key] : key + '|' + contentObj[key];
                    });
                    this.formData.content = content;
                    this.formData.type = this.featureScriptClone?.[nv]?.type || 'map';
                }
            },
            'formData.content': {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (this.formData.variable) {
                        this.featureScriptClone = {
                            ...this.featureScriptClone,
                            [this.formData.variable]: {
                                type: this.formData.type,
                                content: this.formData.type === 'map' ? this.tranFeatureScript(nv) : nv
                            }
                        };
                    }
                }
            }
        },
        computed: {
            placeholder() {
                if (this.formData.type === 'javascript') {
                    return this.javascriptValue;
                }
                return this.mapValue;
            },
            formConfig() {
                return [
                    {
                        field: 'variable',
                        label: this.i18n.optionalVariable,
                        slots: {
                            component: 'variableComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'type',
                        label: this.i18n.mappingRelationship,
                        slots: {
                            component: 'typeComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'content',
                        slots: {
                            component: 'contentComponent'
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.formData.variable = this.defaultVariable;
                this.variableData = this.selectData.map((item) => {
                    if (this.featureScript?.[item]) {
                        return {
                            value: item,
                            displayName: item + ' *'
                        };
                    }
                    return {
                        value: item,
                        displayName: item
                    };
                });
                this.featureScriptClone = FamKit.deepClone(this.featureScript);
            },
            help() {
                this.helpVisible = true;
            },
            submit() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                resolve(this.featureScriptClone);
                            } else {
                                reject(new Error(this.i18n.configureVariableConversion));
                            }
                        })
                        .catch(reject);
                });
            },
            tranFeatureScript(featureScript) {
                const contentArr = featureScript.split('\n');
                const content = {};
                contentArr.forEach((item) => {
                    const itemArr = item.split('|');
                    if (itemArr[0]) {
                        content[itemArr[0]] = itemArr[1];
                    }
                });
                return content;
            },
            onChange(type) {
                if(!this.formData.content) {
                    return
                }
                this.$confirm(this.i18n.confirmChange, this.i18n.confirmChange, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    type: 'warning'
                }).then(() => {
                    this.formData.content= ''
                }).catch(() => {
                    const map = {
                        'javascript': 'map',
                        'map': 'javascript'
                    }
                    this.formData.type = map[type]
                })
            }
        }
    };
});
