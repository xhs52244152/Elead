define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <fam-table-col-set
                :visible.sync="colSettingVisible"
                :title="exportTitle"
                :columns-list="columnSetList"
                :default-columns="defaultColumns"
                show-label="label"
                type="colSet"
                valueKey="oid"
                v-on="$listeners"
            ></fam-table-col-set>
        `,
        props: {
            visible: Boolean,
            title: {
                type: String,
                default: ''
            },
            columnSetList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            defaultColumns: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        components: {
            FamTableColSet: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            )
        },
        computed: {
            colSettingVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            exportTitle() {
                return this.title || this.i18nMappingObj.fieldSet;
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/ExportDialog/locale/index.js'),
                i18nMappingObj: {
                    fieldSet: this.getI18nByKey('fieldSet')
                }
            };
        },
        methods: {
            fnColSettingSubmit(data) {
                this.$emit('before-submit', data);
            }
        }
    };
});
