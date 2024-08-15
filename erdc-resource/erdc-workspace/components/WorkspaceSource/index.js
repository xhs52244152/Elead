define([
    'text!' + ELMP.func('erdc-workspace/components/WorkspaceSource/index.html'),
    ELMP.func('erdc-workspace/api.js')
], function (template, Api) {

    return {
        name: 'WorkspaceSource',
        template,
        props: {
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-workspace/locale/index.js'),
                partsPanelUnfold: true,
                epmDocPanelUnfold: true,
                form: {}
            };
        },
        computed: {
            formShowType() {
                return this.$route.meta.openType || 'detail';
            },
            formConfigs() {
                return function (type = '') {
                    return [
                        {
                            field: type + '_configType',
                            component: 'custom-select',
                            label:
                                this.formShowType === 'detail'
                                    ? this.i18n.selectedConfig
                                    : this.i18n.type,
                            readonly: this.formShowType === 'detail',
                            props: {
                                row: {
                                    componentName: 'virtual-select',
                                    requestConfig: {
                                        url: Api.treeConfigType,
                                        viewProperty: 'displayName',
                                        valueProperty: 'value',
                                        params: {
                                            status: '1'
                                        }
                                    },
                                    clearNoData: true // value未匹配到option中数据时，清除数据项
                                }
                            },
                            col: 12
                        }
                    ];
                };
            }
        },
        watch: {
            formData: {
                immediate: true,
                handler(nv) {
                    if (!_.isEmpty(nv)) {
                        this.form = nv;
                    }
                }
            }
        },
        methods: {
            submit() {
                let { partSourceForm, epmDocSourceForm } = this.$refs;
                return new Promise((resolve) => {
                    let partData = partSourceForm?.serializeEditableAttr();
                    let epmDocData = epmDocSourceForm?.serializeEditableAttr();
                    resolve({
                        partConfigSpecRawVo: partData.map((item) => _.extend({}, item, { attrName: 'configType' })),
                        epmDocConfigSpecRawVo: epmDocData.map((item) => _.extend({}, item, { attrName: 'configType' }))
                    });
                });
            }
        }
    };
});
