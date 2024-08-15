define([], function () {
    return {
        data() {
            return {
                searchName: '',
                selectedData: [],
                visibleForBatchEdit: false,
                visible: false,
                tableData: []
            };
        },
        computed: {
            filteredTableData() {
                return this.tableData.filter((item) => !this.searchName || item.name.includes(this.searchName));
            },
            isBatchEdit() {
                return this.tableData.length > 1;
            }
        },
        methods: {
            handleBatchEdit() {
                if (this.selectedData.length === 0) {
                    return this.$message.warning(this.i18n.selectTip);
                }
                this.visibleForBatchEdit = true;
            },
            handleDialogClosed() {
                this.searchName = '';
                const keys = [...Object.keys(this.batchEditFormData)];
                keys.forEach((key) => {
                    this.batchEditFormData[key] = '';
                });
                this.selectedData = [];
            },
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            }
        }
    };
});
