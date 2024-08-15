define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.label"
                field="props.viewTableConfig.viewMenu.showNavBar"
            >
                <custom-select
                    v-model="showNavBar"
                    clearable
                    filterable
                    :multiple="multiple"
                    :row="row"
                    >
                </custom-select>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    label: this.getI18nByKey('displayView'),
                    pleaseInput: this.getI18nByKey('请选择')
                },
                showNavBarData: []
            };
        },
        watch: {
            'schema.props.viewTableConfig.tableKey': {
                immediate: true,
                deep: true,
                handler(tableKey) {
                    if (tableKey) {
                        this.getShowNavBarData();
                    }
                }
            }
        },
        computed: {
            showNavBar: {
                get() {
                    return this.schema?.props?.viewTableConfig?.viewMenu?.showNavBar || null;
                },
                set(showNavBar) {
                    const props = this.schema.props || {};
                    ErdcKit.setFieldValue(props, 'viewTableConfig.viewMenu.showNavBar', showNavBar, this, '.');
                    this.setSchemaValue('props', props);
                }
            },
            row() {
                return {
                    componentName: 'constant-select', // 固定
                    viewProperty: 'displayName', // 显示的label的key
                    valueProperty: 'oid', // 显示value的key
                    referenceList: this.showNavBarData
                };
            },
            tableKey() {
                return this.schema?.props?.viewTableConfig?.tableKey || '';
            },
            multiple() {
                return !this.schema?.props?.viewTableConfig?.viewMenu?.hiddenNavBar ?? true;
            }
        },
        methods: {
            getShowNavBarData() {
                this.$famHttp({
                    url: '/fam/view/getViews',
                    methods: 'get',
                    data: {
                        viewType: true, // 区分是否在系统管理中调用
                        tableKey: this.tableKey, // 表格key
                        containerOid: this.$store?.state.app?.container?.oid // 容器oid
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.showNavBarData = data?.tableViewVos || [];
                });
            }
        }
    };
});
