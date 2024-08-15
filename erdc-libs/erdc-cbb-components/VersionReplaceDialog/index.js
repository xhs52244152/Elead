define([
    'text!' + ELMP.resource('erdc-cbb-components/VersionReplaceDialog/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'VersionReplaceDialog',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            column: {
                type: Array,
                default: function () {
                    return [
                        {
                            type: 'checkbox',
                            width: 40,
                            align: 'center'
                        },
                        {
                            prop: 'number', // 列数据字段key
                            title: '编号' // 列头部标题
                        },
                        {
                            prop: 'name', // 列数据字段key
                            title: '名称' // 列头部标题
                        },
                        {
                            prop: 'version', // 列数据字段key
                            title: '版本' // 列头部标题
                        }
                    ];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/VersionReplaceDialog/locale/index.js'),
                loading: false,
                replaceVisible: false,
                tableData: [],
                selectedVersionData: []
            };
        },
        computed: {
            dialogTitle() {
                return this.title || this.i18n.replaceTitleTips;
            }
        },
        methods: {
            open(data = []) {
                this.replaceVisible = true;
                this.tableData = data.map((item) => {
                    item.versionValue = item.validatorOid;

                    item.versionOption = item.conflictItemVoList.map((v) => {
                        return {
                            label: v?.version?.displayName,
                            value: v?.oid?.value,
                            oid: v?.oid?.value,
                            masterRef: v?.masterRef?.value,
                            name: item.name,
                            number: item.number
                        };
                    });
                    return item;
                });
                this.selectedVersionData = this.tableData;
            },
            handleCheckboxChange({ records = [] }) {
                this.selectedVersionData = records;
            },
            handleCheckboxAll({ records = [] }) {
                this.selectedVersionData = records;
            },
            confirm() {
                this.loading = true;
                this.$emit('confirm', this.selectedVersionData, (mark) => {
                    if (mark) {
                        this.replaceVisible = false;
                    }
                    this.loading = false;
                });
            },
            cancel() {
                this.$emit('cancel');
                this.replaceVisible = false;
            }
        }
    };
});
