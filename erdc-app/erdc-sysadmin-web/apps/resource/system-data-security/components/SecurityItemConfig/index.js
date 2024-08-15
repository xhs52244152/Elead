define([
    'text!' + ELMP.resource('system-data-security/components/SecurityItemConfig/index.html'),
    'css!' + ELMP.resource('system-data-security/components/SecurityItemConfig/style.css')
], function (template) {
    const erdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            FamErdTable: erdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-data-security/locale/index.js'),
                tableData: [],
                searchValue: '',
                tableDataCopy: []
            };
        },
        computed: {
            columns() {
                return [
                    {
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'securityLevel',
                        title: this.i18n.securityLevel,
                        width: 200
                    },
                    {
                        prop: 'linkedSecurityLevel',
                        title: this.i18n.linkedSecurityLevel,
                        tips: this.i18n.linkedSecurityLevelTips
                    }
                ];
            }
        },
        watch: {
            searchValue(newVal) {
                this.searchFn(newVal);
            }
        },
        mounted() {
            this.getTableData();
        },
        methods: {
            getTableData() {
                this.$famHttp({
                    url: 'fam/SecurityLabelDataFrom',
                    method: 'POST'
                }).then(({ data = [] }) => {
                    this.tableData = data;
                    this.tableDataCopy = erdcKit.deepClone(this.tableData);
                });
            },
            searchFn: _.debounce(function (value) {
                if (!value) {
                    this.tableData = this.tableDataCopy;
                    return;
                }
                this.tableData = this.tableDataCopy.filter((item) => {
                    return item.securityLevel.includes(value);
                });
            }, 300)
        }
    };
});
