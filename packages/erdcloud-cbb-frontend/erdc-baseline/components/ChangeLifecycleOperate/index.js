define([
    'text!' + ELMP.func('erdc-baseline/components/ChangeLifecycleOperate/index.html'),
    ELMP.func('erdc-baseline/components/batchEditMixin.js'),
    'css!' + ELMP.func('erdc-baseline/index.css')
], function (template, batchEditMixin) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('CbbBaseline');

    return {
        name: 'BaselineChangeLifecycleOperate',
        template,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        mixins: [batchEditMixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                className: '',
                batchEditFormData: {
                    lifecycleStatus: ''
                }
            };
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'baseline' });
            },
            baselineClassName() {
                return this.viewTableMapping.className;
            },
            lifecycleStatusOptions() {
                return this.tableData.length > 0 ? this.tableData[0].lifecycleStatusOptions : [];
            }
        },
        methods: {
            editActivedEvent({ row }) {
                let timer = setTimeout(() => {
                    this.$refs?.[`select-${row.oid}`]?.$el?.querySelector('input')?.focus();
                    clearTimeout(timer);
                }, 0);
            },
            open(rows, isDetail) {
                if (!_.isArray(rows)) {
                    rows = [rows];
                }
                rows = rows.map((i) => {
                    return {
                        name: isDetail ? i.name : i['erd.cloud.cbb.baseline.entity.Baseline#name'],
                        code: isDetail ? i.identifierNo : i['erd.cloud.cbb.baseline.entity.Baseline#identifierNo'],
                        lifecycleStatus: isDetail
                            ? i.lifecycleStatus.status
                            : i['erd.cloud.cbb.baseline.entity.Baseline#lifecycleStatus.status'],
                        newLifecycleStatus: '',
                        oid: i.oid,
                        lifecycleStatusOptions: []
                    };
                });
                this.loadLifecycleStatus(rows.map((i) => i.oid)).then((resp) => {
                    if (resp.success) {
                        let data = resp.data || {};
                        rows.forEach((i) => {
                            if (data[i.oid]) {
                                i.lifecycleStatusOptions = data[i.oid].map((ii) => {
                                    return {
                                        label: ii.displayName,
                                        value: ii.name
                                    };
                                });
                                if (isDetail) {
                                    i.lifecycleStatus = i.lifecycleStatusOptions.find(
                                        (item) => item.value === i.lifecycleStatus
                                    )?.label;
                                }
                            }
                        });
                        this.tableData = rows;
                        this.visible = true;
                    }
                });
            },
            saveBatchEditData() {
                const applyBatchUpdateRows = this.tableData.filter(
                    (item) => this.selectedData.findIndex((sItem) => sItem.oid === item.oid) >= 0
                );
                const newLifecycleStatus = this.batchEditFormData.lifecycleStatus;
                applyBatchUpdateRows.forEach((item) => {
                    if (newLifecycleStatus) {
                        item.newLifecycleStatus = newLifecycleStatus;
                    }
                });
                this.visibleForBatchEdit = false;
            },
            getLifecycleStatusConfig(row) {
                return row.lifecycleStatusOptions.find((item) => item.value === row.newLifecycleStatus);
            },
            loadLifecycleStatus(oids) {
                return this.$famHttp({
                    url: '/baseline/common/template/states',
                    method: 'post',
                    data: {
                        branchIdList: oids,
                        className: this.baselineClassName,
                        successionType: 'SET_STATE'
                    }
                });
            },
            checkBeforeSubmit() {
                for (let i of this.tableData) {
                    if (!i.newLifecycleStatus) {
                        this.$message.warning(this.i18n.lifecycleStatusRequireTips);
                        return false;
                    }
                }
                return true;
            },
            handleChangeState() {
                if (this.checkBeforeSubmit()) {
                    this.$famHttp({
                        url: '/baseline/common/batchResetState',
                        method: 'post',
                        data: {
                            className: this.baselineClassName,
                            resetVoList: this.tableData.map((i) => {
                                return {
                                    oid: i.oid,
                                    stateName: i.newLifecycleStatus
                                };
                            })
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18n.setStatusSuccess);
                            this.visible = false;
                            this.$emit('success');
                        }
                    });
                }
            }
        }
    };
});
