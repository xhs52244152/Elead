define([
    'text!' + ELMP.resource('biz-bpm/editor/components/BoundaryEvent/template.html'),
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js')
], function (template, PropertiesPanelMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: template,
        mixins: [PropertiesPanelMixin],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/components/BoundaryEvent/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'errorEvent',
                    'misquote'
                ]),
                expanded: true,
                errorForm: {
                    errorref: ''
                }
            }
        },
        watch:{
            activeElement() {
                this.getCurrentData();
            }
        },
        computed: {
            formConfigs() {
                return [
                    {
                        label: this.i18nMappingObj.misquote,
                        field: 'errorref',
                        component: 'erd-input',
                        col: 24
                    }
                ]
            }
        },
        mounted() {
            this.getCurrentData();
        },
        methods: {
            onFieldChange({ field }, value) {
                this.saveExtensionValues(this.activeElement, field, value)
            },
            getCurrentData() {
                let defaultList = this.getExtensionValue(this.activeElement, 'errorref', true) || [];
                this.errorForm.errorref = defaultList.length ? defaultList[0].errorref : '';
            }
        }
    }
})
