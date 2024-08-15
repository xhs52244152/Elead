define([
    'text!' + ELMP.resource('biz-code-rule/components/SignatureTable/index.html'),
    'css!' + ELMP.resource('biz-code-rule/components/SignatureTable/style.css')
], (template) => {
    const FamKit = require('fam:kit');
    return {
        name: 'SignatureTable',
        template,
        components: {
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            SignatrueForm: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/SignatrueForm/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        props: {
            data: {
                type: Object,
                default() {
                    return null;
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                tableHeight: document.documentElement.clientHeight - 40 -24 - 32 - 28 - 16 - 32 - 16 - 16 - 28,
                tableData: [],
                tableDataClone: [],
                visible: false,
                ruleId: '',
                codeRuleData: [],
                searchValue: '',
                total: 0,
                pageIndex: 1,
                pageSize: 20
            };
        },
        watch: {
            searchValue(nv) {
                if (!nv) {
                    this.tableData = this.tableDataClone;
                } else {
                    this.tableData = this.tableDataClone.filter((item) => {
                        return item.featureCode.includes(nv);
                    });
                }
            }
        },
        computed: {
            titleName() {
                return this.data?.[this.$store.getters.className('codeRule') + '#name'] || '--'
            },
            column() {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'featureCode',
                        title: this.i18n.featureCode,
                        tips: this.i18n.featureCodeTips,
                        minWidth: 200
                    },
                    {
                        prop: 'serialCode',
                        title: this.i18n.sequenceChars,
                        editRender: {},
                        tips: this.$t('sequenceCharsCanInputTips', {sequenceChars: this.data?.sequenceChars}),
                        minWidth: 200
                    },
                    {
                        prop: 'createTime',
                        title: this.i18n.createTime,
                        minWidth: 200
                    },
                    {
                        prop: 'updateTime',
                        title: this.i18n.editTime,
                        minWidth: 200
                    }
                ];
            }
        },
        mounted() {
            this.getTableData();
        },
        methods: {
            refreshTable() {
                this.getTableData();
            },
            getTableData() {
                this.$famHttp({
                    url: '/fam/search',
                    data: {
                        className: this.$store.getters.className('codeMaxSerial'),
                        pageIndex: this.pageIndex,
                        pageSize: this.pageSize,
                        conditionDtoList: [
                            {
                                oper: 'EQ',
                                attrName: 'ruleRef',
                                value1: this.data.oid || ''
                            }
                        ]
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        const { records } = resp?.data || {};
                        this.total = Number(resp.data.total);
                        this.tableData = records.map((item) => {
                            const obj = {};
                            item.attrRawList.forEach((ite) => {
                                obj[ite.attrName] = ite.value;
                            });
                            obj['serialCodeClone'] = FamKit.deepClone(obj.serialCode);
                            return {
                                ...item,
                                ...obj
                            };
                        });
                        this.tableDataClone = FamKit.deepClone(this.tableData);
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    });
            },
            callback() {
                this.$emit('goto', 'codeRuleTable');
            },
            onCreate() {
                this.visible = true;
                this.codeRuleData = this.data;
            },
            onInput(data, row) {
                const reg = new RegExp('[^' + this.data?.sequenceChars + ']', 'g');
                this.$set(row, 'serialCode', data.replace(reg, ''));
            },
            editActived({ column }) {
                if (column.property == 'serialCode') {
                    this.$nextTick(() => {
                        this.$refs.serialCodeInput.$el.querySelector('input').focus();
                    });
                }
            },
            editClosed({ row, column }) {
                this.$famHttp({
                    url: '/fam/update',
                    data: {
                        className: this.$store.getters.className('codeMaxSerial'),
                        oid: row.oid,
                        attrRawList: [
                            {
                                attrName: 'serialCode',
                                value: row.serialCode
                            }
                        ]
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18n.editSuccessfully,
                            showClose: true
                        });
                        this.$set(row, 'serialCodeClone', row.serialCode);
                    })
                    .catch((error) => {
                        this.$set(row, 'serialCode', row.serialCodeClone);
                    });
            },
            onCancel() {
                this.visible = false;
            },
            onSubmit() {
                const { signatrueForm } = this.$refs;
                signatrueForm
                    .submit()
                    .then((data) => {
                        this.$famHttp({
                            url: '/fam/create',
                            data: {
                                className: this.$store.getters.className('codeMaxSerial'),
                                attrRawList: [
                                    {
                                        attrName: 'ruleRef',
                                        value: this.data.oid
                                    },
                                    {
                                        attrName: 'featureCode',
                                        value: data.featureCode
                                    },
                                    {
                                        attrName: 'serialCode',
                                        value: data.serialCode
                                    }
                                ]
                            },
                            method: 'POST'
                        })
                            .then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message: this.i18n.createSuccessfully,
                                    showClose: true
                                });
                                this.refreshTable();
                                this.onCancel();
                            })
                            .catch((error) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: error?.data?.message || error,
                                //     showClose: false
                                // });
                            });
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || error,
                            showClose: true
                        });
                    });
            },
            handleSizeChange(pageSize) {
                this.pageIndex = 1;
                this.pageSize = pageSize;
                this.refreshTable();
            },
            handleCurrentChange(pageIndex) {
                this.pageIndex = pageIndex;
                this.refreshTable();
            }
        }
    };
});
