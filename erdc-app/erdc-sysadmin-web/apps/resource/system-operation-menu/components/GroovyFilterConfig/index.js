define(['text!' + ELMP.resource('system-operation-menu/components/GroovyFilterConfig/index.html')], function (
    template
) {
    return {
        template,
        props: {
            row: {
                type: Object,
                default: () => ({})
            },
            businessName: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                i18nMappingObj: {
                    name: this.getI18nByKey('name'),
                    businessName: this.getI18nByKey('businessName'),
                    executionObject: this.getI18nByKey('executionObject'),
                    executionInfo: this.getI18nByKey('executionInfo'),
                    operationButton: this.getI18nByKey('operationButton')
                },
                form: {
                    statusResult: false,
                    status: 0
                },
                expanded: true
            };
        },
        created() {
            this.initForm();
        },
        methods: {
            initForm() {
                const { groovyScriptVoList } = this.row;
                if (groovyScriptVoList?.length) {
                    this.form.status = groovyScriptVoList[0].status ?? 0;
                }
            },
        }
    };
});
