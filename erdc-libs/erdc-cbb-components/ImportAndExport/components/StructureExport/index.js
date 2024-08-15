define([
    'text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/StructureExport/index.html'),
    ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js')
], function (template, locale) {
    const ErdcKit = require('erdc-kit');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const AttrsList = [
        {
            label: i18n?.['名称'],
            value: 'name',
            isRequired: true
        },
        {
            label: i18n?.['编码'],
            value: 'identifierNo',
            isRequired: true
        }
    ];

    return {
        name: 'StructureExport',
        template,
        components: {
            Transfer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ImportAndExport/components/Transfer/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
                tableData: AttrsList,
                fields: []
            };
        },
        watch: {
            tableData: {
                handler: function (nv) {
                    const tableData = ErdcKit.deepClone(nv) || [];
                    this.fields = _.filter(tableData, (item) => item?.isRequired) || [];
                },
                immediate: true
            }
        },
        created() {},
        methods: {
            // 获取数据
            getData() {
                const data = {};
                return data;
            },
            // 校验
            verify() {
                let valid = true;
                let message = null;
                return { valid, message };
            }
        }
    };
});
