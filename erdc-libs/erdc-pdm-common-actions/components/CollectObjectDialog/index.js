define([
    ELMP.resource('erdc-cbb-components/CollectObjects/index.js'),
    ELMP.resource('erdc-pdm-common-actions/components/CommonDialog/index.js'),
    'erdcloud.i18n',
    ELMP.resource('erdc-pdm-common-actions/components/CollectObjectDialog/locale/index.js')
], function (CollectObjects, commonDialog, ErdcI18n, locale) {
    const i18n = ErdcI18n.wrap(locale);
    return {
        props: {
            tableData: {
                type: Array,
                default: () => []
            },
            className: String
        },
        template: `
            <commonDialog
                @confirm="confirm"
                :title="i18nMap.collectObjs"
                ref="dialog"
                :loading="loading"
            >
                <collectObjects
                    slot="content"
                    :table-data="tableData"
                    :class-name="className"
                    ref="collectObject"
                >
                </collectObjects>
            </commonDialog>
        `,
        components: {
            CollectObjects,
            commonDialog
        },
        data() {
            return {
                loading: false,
                i18nMap: i18n
            };
        },
        methods: {
            confirm() {
                this.$emit('success', this.$refs.collectObject?.getData?.() || []);
                this.$refs.dialog?.close?.();
            }
        }
    };
});
