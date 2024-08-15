define([
    'text!' + ELMP.resource('biz-signature/taskCreate/formatParams/index.html'),
    'css!' + ELMP.resource('biz-signature/taskCreate/index.css')
], function (tmpl) {
    const formDefault = {
        orientation: 'portrait',
        type: 'A4',
        unit: 'mm',
        pageSize: {
            width: '',
            height: ''
        },
        margins: {
            top: '19.1',
            bottom: '19.1',
            left: '17.8',
            right: '17.8'
        }
    };

    return {
        template: tmpl,
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-signature/locale'),
                visible: false,
                formData: Object.assign({}, formDefault)
            };
        },
        computed: {
            formConfigs() {
                const { i18nMappingObj } = this;
                const config = [
                    {
                        field: 'orientation',
                        label: i18nMappingObj.orientation,
                        component: 'FamRadio',
                        required: true,
                        props: {
                            options: [
                                {
                                    label: i18nMappingObj.portrait,
                                    value: 'portrait'
                                },
                                {
                                    label: i18nMappingObj.landscape,
                                    value: 'landscape'
                                }
                            ]
                        },
                        col: 24
                    },
                    {
                        field: 'type',
                        label: i18nMappingObj.pageType,
                        slots: {
                            component: 'type'
                        },
                        required: true,
                        col: 24
                    },
                    {
                        field: 'unit',
                        label: i18nMappingObj.unit,
                        component: 'erd-input',
                        required: true,
                        readonly: true,
                        col: 24
                    },
                    {
                        field: 'pageSize',
                        label: i18nMappingObj.pageSize,
                        required: true,
                        slots: {
                            component: 'pageSize'
                        },
                        col: 24
                    },
                    {
                        field: 'margins',
                        label: i18nMappingObj.pageMargin,
                        required: true,
                        slots: {
                            component: 'margins'
                        },
                        col: 24
                    }
                ];
                return config;
            },
            typeOpt() {
                return [
                    {
                        label: 'A4',
                        value: 'A4',
                        pageSize: {
                            width: '210',
                            height: '297'
                        }
                    },
                    {
                        label: 'A3',
                        value: 'A3',
                        pageSize: {
                            width: '297',
                            height: '420'
                        }
                    },
                    {
                        label: 'B5',
                        value: 'B5',
                        pageSize: {
                            width: '176',
                            height: '250'
                        }
                    },
                    {
                        label: 'B4',
                        value: 'B4',
                        pageSize: {
                            width: '250',
                            height: '359'
                        }
                    },
                    {
                        label: this.i18nMappingObj.custom,
                        value: 'custom',
                        pageSize: {
                            width: '',
                            height: ''
                        }
                    }
                ];
            }
        },
        methods: {
            show() {
                this.formData = JSON.parse(JSON.stringify(formDefault));
                this.changeType('A4');
                this.visible = true;
            },
            changeType(val) {
                const result = this.typeOpt.find((item) => item.value === val);
                if (result) {
                    this.formData.pageSize = result.pageSize;
                }
            },
            submit() {
                delete this.formData.type;
                delete this.formData.unit;
                this.$emit('save-params', this.formData);
                this.visible = false;
            },
            clearData() {
                this.$refs.paramsForm?.clearValidate();
            },
            cancel() {
                this.clearData();
                this.visible = false;
            }
        }
    };
});
