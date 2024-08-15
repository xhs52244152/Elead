define([
    'text!' + ELMP.resource('biz-bpm/editor/components/MailProcessInformation/template.html'),
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js')
], function (template, PropertiesPanelMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        mixins: [PropertiesPanelMixin],
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/MailProcessInformation/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'nodeProcessConfiguration',
                    'compensation',
                    'to',
                    'theme',
                    'duplicate',
                    'hideDuplicate',
                    'text',
                    'character'
                ]),
                expanded: true,
                mailForm: {
                    isforcompensation: false,
                    to: '',
                    subject: '',
                    cc: '',
                    bcc: '',
                    text: '',
                    html: '',
                    charset: ''
                }
            };
        },
        watch: {
            activeElement(activeElement) {
                this.getMailForm();
            }
        },
        computed: {
            formConfigs() {
                return [
                    {
                        label: this.i18nMappingObj.compensation,
                        field: 'isforcompensation',
                        component: 'erd-checkbox',
                        col: 24
                    },
                    {
                        label: this.i18nMappingObj.to,
                        field: 'to',
                        component: 'erd-input',
                        required: true,
                        col: 24
                    },
                    {
                        label: this.i18nMappingObj.theme,
                        field: 'subject',
                        component: 'erd-input',
                        col: 24
                    },
                    {
                        // 抄送
                        label: this.i18nMappingObj.duplicate,
                        field: 'cc',
                        component: 'erd-input',
                        col: 24
                    },
                    {
                        // 隐藏抄送
                        label: this.i18nMappingObj.hideDuplicate,
                        field: 'bcc',
                        component: 'erd-input',
                        col: 24
                    },
                    {
                        label: this.i18nMappingObj.text,
                        field: 'text',
                        component: 'erd-input',
                        required: true,
                        col: 24
                    },
                    {
                        label: 'Html',
                        field: 'html',
                        component: 'erd-input',
                        required: true,
                        col: 24
                    },
                    {
                        // '字符集(编码格式)'
                        label: this.i18nMappingObj.character,
                        field: 'charset',
                        component: 'erd-input',
                        col: 24
                    }
                ];
            },
            schemaMapper() {
                let _this = this;
                return {
                    html: function (schema) {
                        schema.required = !_this.mailForm.text;
                    },
                    text: function (schema) {
                        schema.required = !_this.mailForm.html;
                    }
                };
            },
        },
        mounted() {
            this.getMailForm();
        },
        methods: {
            getMailForm() {
                this.mailForm = {
                    isforcompensation: false,
                    to: '',
                    subject: '',
                    cc: '',
                    bcc: '',
                    text: '',
                    html: '',
                    charset: ''
                };
                let fields = this.getExtensionValue(this.activeElement, 'field', true) || [];
                let isforcompensation = this.getExtensionValue(this.activeElement, 'isforcompensation', true) || [];
                if(isforcompensation.length) this.mailForm.isforcompensation = !(isforcompensation[0].isforcompensation === 'false');
                _.each(fields, item => {
                    this.mailForm[item.name] = item.string;
                });
                return this.mailForm;
            },
            saveSendConfigs(field, value) {
                let fields = this.getExtensionValue(this.activeElement, 'field', true) || [];
                fields = fields?.filter(el => el.name !== field);
                if(typeof value === 'boolean') {
                   return this.saveExtensionValues(this.activeElement, field, value + '');
                }
                fields.push({
                    name: field,
                    string: value
                });
                this.saveExtensionValues(this.activeElement, 'field', fields);
            },
            onFieldChange({ field }, value) {
                this.saveSendConfigs(field, value);
            }
        }
    };
});
