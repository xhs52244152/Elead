define([
    'text!' + ELMP.resource('erdc-pdm-components/ObjectSelection/index.html'),
    'css!' + ELMP.resource('erdc-pdm-components/ObjectSelection/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ObjectSelection',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        props: {
            placement: {
                type: String,
                default: 'bottom'
            },
            trigger: {
                type: String,
                default: 'click'
            },
            width: {
                type: Number,
                default: 368
            },
            currentPage: {
                type: Number,
                default: 1
            },
            pageSizes: {
                type: Array,
                default: () => {
                    return [20, 50, 100];
                }
            },
            pageSize: {
                type: Number,
                default: 50
            },
            layout: {
                type: String,
                default: 'total, sizes, prev, pager, next, jumper'
            },
            small: Boolean,
            streamline: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/ObjectSelection/locale/index.js'),
                tableHeight: 500,
                tableData: [],
                visible: false,
                total: 100
            };
        },
        created() {
            for (let i = 0; i < 100; i++) {
                this.tableData.push({ label: i, value: i });
            }
        },
        methods: {
            handleSizeChange(val) {
                this.$emit('update:pageSizes', val);
            },
            handleCurrentChange(val) {
                this.$emit('update:currentPage', val);
            }
        }
    };
});
