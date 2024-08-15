define([], function () {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ExportDialog',
        template: `
            <FamTableColSet
                :visible.sync="colSettingVisible"
                :title="exportTitle"
                :columns-list="columnSetList"
                :default-columns="defaultColumns"
                show-label="label"
                type="colSet"
                valueKey="oid"
                v-on="$listeners"
            ></FamTableColSet>
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
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/ExportDialog/locale/index.js')
            };
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
                return this.title || this.i18n.fieldSet;
            }
        }
    };
});
