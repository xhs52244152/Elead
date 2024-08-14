define([
    'text!' + ELMP.func('erdc-ppm-template-budget/components/SelectTable/index.html'),
    'fam:http',
    'erdcloud.kit'
], function (template, famHttp, ErdcKit) {
    return {
        template,
        props: {
            styleCss: String,
            value: {
                // 选择的oid
                type: String,
                default: null
            }
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('erdc-ppm-template-budget/locale/index.js'),
                tableData: [],
                loading: false
            };
        },
        created() {
            this.handleSearch();
        },
        computed: {
            innerValue: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('update:value', val);
                }
            }
        },
        methods: {
            async handleSearch() {
                let className = 'erd.cloud.ppm.budget.entity.BudgetTemplate'; // 预算模板
                this.loading = true;
                let res = await famHttp({
                    url: '/ppm/view/table/page',
                    method: 'POST',
                    className: className,
                    data: {
                        className: className,
                        tableKey: 'BudgetTemplateView',
                        pageIndex: 1,
                        pageSize: 999,
                        searchKey: ''
                    }
                }).finally(() => {
                    this.loading = false;
                });
                if (!res.success) {
                    return;
                }
                let templateData = (res.data?.records || []).map((rowData) => {
                    return ErdcKit.deserializeArray(rowData.attrRawList || []);
                });
                let tableData = JSON.parse(JSON.stringify(templateData).replaceAll(className + '#', '')) || [];
                this.tableData = [];
                tableData.forEach((row) => {
                    // 状态为“发布”
                    if (row['status'] == '2') {
                        this.tableData.push(row);
                    }
                    // 如果引用的模板值为非“发布”状态，则添加并禁用该选项
                    else if (this.innerValue === row['oid']) {
                        this.tableData.push({
                            ...row,
                            disabled: true
                        });
                    }
                });
                this.tableData.forEach((r) => (r['label'] = r['name']));
            }
        }
    };
});
