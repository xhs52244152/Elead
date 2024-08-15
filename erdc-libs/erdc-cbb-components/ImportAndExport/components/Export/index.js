define(['text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/Export/index.html')], function (
    template
) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'Export',
        template,
        props: {
            importTypeList: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
                baseInfoUnfold: true,
                typeUnfold: true,
                cateUnfold: true,
                formData: {},
                formConfigs: [],
                readonly: false
            };
        },
        computed: {
            objectType() {
                const [importType] = this.importTypeList || [];
                return importType?.objectType;
            },
            component() {
                const url = `erdc-cbb-components/ImportAndExport/components/${this.objectType}Export/index.js`;
                return {
                    ref: this.objectType,
                    is: ErdcKit.asyncComponent(ELMP.resource(url)),
                    props: {
                        className: this.className,
                        ...this.$attrs
                    }
                };
            }
        },
        created() {
            console.log(this);
        },
        methods: {
            innerOnFieldChange() {}
        }
    };
});
