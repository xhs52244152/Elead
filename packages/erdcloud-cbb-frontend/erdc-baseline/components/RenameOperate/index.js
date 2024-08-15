define([
    'text!' + ELMP.func('erdc-baseline/components/RenameOperate/index.html'),
    ELMP.func('erdc-baseline/components/batchEditMixin.js'),
    ELMP.func('erdc-baseline/const.js'),
    'css!' + ELMP.func('erdc-baseline/index.css')
], function (template, batchEditMixin, CONST) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineRenameOperate',
        template,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        mixins: [batchEditMixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                batchEditFormData: {
                    name: ''
                }
            };
        },
        methods: {
            open(rows, isDetail) {
                rows = rows || [];
                if (!_.isArray(rows)) {
                    rows = [rows];
                }
                this.visible = true;
                this.tableData = rows.map((i) => {
                    return {
                        oid: i.oid,
                        name: isDetail ? i.name : i['erd.cloud.cbb.baseline.entity.Baseline#name'],
                        code: isDetail ? i.identifierNo : i['erd.cloud.cbb.baseline.entity.Baseline#identifierNo'],
                        context: isDetail
                            ? i.containerRef?.displayName
                            : i['erd.cloud.cbb.baseline.entity.Baseline#containerRef'],
                        folder: isDetail
                            ? i.folderRef?.displayName
                            : i['erd.cloud.cbb.baseline.entity.Baseline#folderRef'],
                        newName: ''
                    };
                });
            },
            saveBatchEditData() {
                const applyBatchUpdateRows = this.tableData.filter(
                    (item) => this.selectedData.findIndex((sItem) => sItem.oid === item.oid) >= 0
                );
                const name = this.batchEditFormData.name;
                applyBatchUpdateRows.forEach((item) => {
                    if (name) {
                        item.newName = name;
                    }
                });
                this.visibleForBatchEdit = false;
            },
            handleRename() {
                this.$famHttp({
                    url: '/baseline/common/rename',
                    method: 'post',
                    className: CONST.className,
                    data: this.tableData.map((i) => {
                        return {
                            name: i.newName,
                            oid: i.oid
                        };
                    })
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18n.renameSuccessTip);
                        this.visible = false;
                        this.$emit('success');
                    }
                });
            }
        }
    };
});
