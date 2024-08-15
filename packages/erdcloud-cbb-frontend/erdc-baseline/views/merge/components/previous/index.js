define([
    'text!' + ELMP.func('erdc-baseline/views/merge/components/previous/index.html'),
    ELMP.func('erdc-baseline/const.js')
], function (template, CONST) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters, mapMutations } = createNamespacedHelpers('CbbBaseline');

    return {
        name: 'BaselineMergePrevious',
        template,
        props: {},
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js'))
        },
        watch: {
            rightTableData: {
                handler: function (nv) {
                    const excluded = _.map(nv, (item) => {
                        const identifierNo =
                            _.find(item?.attrRawList, (item) => new RegExp('identifierNo$').test(item?.attrName)) || {};
                        return identifierNo?.value || item?.identifierNo || '';
                    });
                    this.objectForm.excluded = _.compact(excluded) || [];
                },
                immediate: true
            }
        },
        created() {
            this.loadSelectedData();
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                panelUnfoldMode: true,
                panelUnfoldForConflict: true,
                visible: false,
                formData: {
                    checkList: ['mainBaselineVersion', 'maxVersion'],
                    removeOtherBaseline: false
                },
                rightTableData: [],
                objectForm: {
                    visible: false,
                    urlConfig: (vm) => {
                        const data = ErdcKit.deepClone(vm?.defaultUrlConfig?.data) || {};
                        data.conditionDtoList = _.filter(
                            data?.conditionDtoList,
                            (item) => item?.attrName?.split('#')?.[1] !== 'typeReference'
                        );
                        data.conditionDtoList = _.map(data?.conditionDtoList, (item) => {
                            return {
                                ...item,
                                attrName: CONST.className + '#' + item?.attrName.split('#')[1]
                            };
                        });
                        return {
                            data: {
                                className: CONST.className,
                                tableKey: 'BaselineView',
                                ...data
                            }
                        };
                    },
                    excluded: [],
                    leftTableColumns: (leftTableColumns) => {
                        const data = ErdcKit.deepClone(leftTableColumns) || [];
                        return _.filter(data, (item) => {
                            return item?.prop !== ' lifecycleStatus.status' || item?.prop !== 'containerRef';
                        });
                    },
                    defaultView: true
                }
            };
        },
        computed: {
            ...mapGetters(['getSelectedForMerge']),
            // 是否有最大最小版本被勾选
            columns() {
                return [
                    {
                        type: 'checkbox',
                        prop: 'checkbox',
                        width: 40,
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version,
                        width: 100
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operate
                    }
                ];
            },
            conflictOpts() {
                return [
                    {
                        key: this.i18n.mainBaselineVersion,
                        value: 'mainBaselineVersion'
                        // description: handleI18n('pdm_i18n_baseline_master_version_desc')
                    },
                    {
                        key: this.i18n.maxVersion,
                        value: 'maxVersion',
                        showDesc: false
                        // description: "以冲突对象的最新版本作为合并后的基线对象版本"
                        // description: handleI18n('pdm_i18n_baseline_maxVersion_desc')
                    },
                    {
                        key: this.i18n.minVersion,
                        value: 'minVersion',
                        showDesc: false
                        // description: "以冲突对象的最小版本作为合并后的基线对象版本"
                        // description: handleI18n('pdm_i18n_baseline_minVersion_desc')
                    }
                ];
            },
            hasMaxVersion() {
                return this.formData.checkList.includes('maxVersion');
            },
            hasMinVersion() {
                return this.formData.checkList.includes('minVersion');
            }
        },
        methods: {
            ...mapMutations(['setSelectedForMerge', 'setMergeInfo']),
            openAddBaselineDialog() {
                return (this.objectForm.visible = true);
            },
            removeBaseline() {
                let selectedBaseline = this.$refs.erdTable.$refs.xTable.getCheckboxRecords();
                if (!selectedBaseline || !selectedBaseline.length) {
                    return this.$message.info(this.i18n['请勾选对象']);
                }
                if (selectedBaseline && selectedBaseline?.length) {
                    this.rightTableData = this.rightTableData.filter((i) => selectedBaseline.indexOf(i) === -1);
                }
                this.checkMainBaseline();
            },
            checkMainBaseline() {
                let mainBaseline = this.rightTableData.find((i) => i.isMain);
                if (!mainBaseline && this.rightTableData.length) {
                    this.rightTableData[0].isMain = true;
                }
            },
            loadSelectedData() {
                if (this.getSelectedForMerge.length > 0) {
                    return this.$famHttp({
                        url: '/baseline/search/by/oid',
                        method: 'post',
                        data: {
                            className: CONST.className,
                            oidList: this.getSelectedForMerge
                        }
                    }).then((resp) => {
                        let data = resp.data.records || [];
                        this.rightTableData = data.map((item, index) => {
                            return {
                                isMain: index === 0,
                                ...item,
                                ...ErdcKit.deserializeArray(item.attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                })
                            };
                        });
                        this.setSelectedForMerge([]);
                    });
                } else {
                    return Promise.resolve();
                }
            },
            // 是否禁用冲突选项
            getConflictOptStatus(raw) {
                switch (raw.value) {
                    case 'mainBaselineVersion':
                        return true;
                    default:
                        return false;
                }
            },
            // 切换冲突条件的选择项
            changeConflictOpts(raw) {
                this.toggleVersion(raw);
            },
            // 最大版本最小版本必须选择一个
            toggleVersion(raw) {
                // 最大最小版本的value值
                const max = 'maxVersion',
                    min = 'minVersion';
                switch (raw.value) {
                    case max: {
                        if (this.hasMinVersion) {
                            // 选择了最大版本就去除最小版本;
                            this.formData.checkList = this.formData.checkList.filter((item) => item != min);
                        } else if (!this.hasMinVersion && !this.hasMaxVersion) {
                            // 反选最大最小
                            this.formData.checkList.push(min);
                        }
                        break;
                    }
                    case min: {
                        if (this.hasMaxVersion) {
                            this.formData.checkList = this.formData.checkList.filter((item) => item != max);
                        } else if (!this.hasMinVersion && !this.hasMaxVersion) {
                            this.formData.checkList.push(max);
                        }
                        break;
                    }
                    default:
                }
            },
            confirm(data) {
                let rightTableData = ErdcKit.deepClone(this.rightTableData) || [];
                if (rightTableData.length) {
                    for (let i = data.length - 1; i >= 0; i--) {
                        for (let j = 0; j < rightTableData.length; j++) {
                            if (data[i]?.oid === rightTableData[j]?.oid) {
                                data.splice(i, 1);
                            }
                        }
                    }
                }
                this.rightTableData = ErdcKit.deepClone(this.rightTableData).concat(data);
                this.checkMainBaseline();
            },
            setMainBaseline(row) {
                this.rightTableData.forEach((i) => (i.isMain = false));
                row.isMain = true;
            },
            submit(callback) {
                if (this.rightTableData && this.rightTableData.length > 1) {
                    let masterBaseline = '';
                    let baselineOIds = this.rightTableData.map((i) => {
                        if (i.isMain) {
                            masterBaseline = i.oid;
                        }
                        return i.oid;
                    });
                    this.setSelectedForMerge(baselineOIds);
                    return this.$famHttp({
                        url: '/baseline/baselineMerge',
                        method: 'post',
                        className: CONST.className,
                        data: {
                            baselineMergeList: baselineOIds,
                            masterBaselineOid: masterBaseline,
                            maxVersion: this.hasMaxVersion,
                            removeOtherBaseline: this.formData.removeOtherBaseline
                        }
                    }).then((resp) => {
                        if (resp.success) {
                            this.setMergeInfo({
                                ...resp.data,
                                masterBaselineOid: masterBaseline,
                                deleteBaseline: this.formData.removeOtherBaseline,
                                baselineMergeList: this.rightTableData.map((item) => item.oid)
                            });
                            if (_.isFunction(callback)) {
                                callback({
                                    validate: true,
                                    data: resp.data
                                });
                            }
                            return {
                                validate: true,
                                data: resp.data
                            };
                        } else {
                            if (_.isFunction(callback)) {
                                callback({
                                    validate: false,
                                    message: resp.message
                                });
                            }
                            return {
                                validate: false,
                                message: resp.message
                            };
                        }
                    });
                }
                if (_.isFunction(callback)) {
                    callback(false);
                }
                // 合并基线至少需要两条基线
                this.$message.info(this.i18n.mergeBaselineValidateTip);
                return Promise.reject();
            }
        },
        mounted() {}
    };
});
