define([
    'text!' + ELMP.resource('biz-signature/taskCreate/index.html'),
    ELMP.resource('biz-signature/CONST.js')
], function (tmpl, CONST) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: tmpl,
        components: {
            sign: ErdcKit.asyncComponent(ELMP.resource('biz-signature/taskCreate/signatureSign/index.js')),
            convert: ErdcKit.asyncComponent(ELMP.resource('biz-signature/taskCreate/convertForm/index.js')),
            watermark: ErdcKit.asyncComponent(ELMP.resource('biz-signature/taskCreate/watermarkTask/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: CONST.i18nPath,
                i18nMappingObj: this.getI18nKeys([
                    'taskType',
                    'signatureSign',
                    'convert',
                    'watermarkTask',
                    'type',
                    'createTask',
                    'confirm',
                    'cancel'
                ]),
                visible: false,
                baseInfoUnfold: true,
                labelWidth: '120px',
                formData: {
                    fileType: 'sign'
                }
            };
        },
        computed: {
            options() {
                const { i18nMappingObj } = this;
                return [
                    {
                        label: i18nMappingObj.signatureSign,
                        value: 'sign'
                    },
                    {
                        label: i18nMappingObj.convert,
                        value: 'convert'
                    },
                    {
                        label: i18nMappingObj.watermarkTask,
                        value: 'watermark'
                    }
                ];
            },
            formConfigs() {
                const { i18nMappingObj } = this;
                const config = [
                    {
                        field: 'fileType',
                        label: i18nMappingObj.taskType,
                        required: true,
                        col: 12,
                        slots: {
                            component: 'fileType'
                        }
                    }
                ];
                return config;
            }
        },
        methods: {
            submit() {
                this.$refs.task.submit().then(() => {
                    this.$emit('submitTask');
                    this.visible = false;
                });
            },
            show() {
                this.visible = true;
                this.formData.fileType = 'sign';
            },
            cancel() {
                this.visible = false;
            }
        }
    };
});
