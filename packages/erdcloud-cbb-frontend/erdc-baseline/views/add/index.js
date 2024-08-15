define([
    'text!' + ELMP.func('erdc-baseline/views/add/index.html'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, CONSTS, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const Vuex = require('vuex');
    const { mapGetters, mapMutations } = Vuex.createNamespacedHelpers('CbbBaseline');
    // 检入状态
    const CHECKED_IN_TYPE = 'CHECKED_IN';

    return {
        name: 'BaselineAdd',
        template,
        props: {
            appName: String,
            viewTypesList: {
                type: [Array, Function],
                default() {
                    return ErdcStore.getters?.['CbbBaseline/getViewTypesList'] || [];
                }
            }
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            BaselineForm: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/BaselineForm/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js')),
            VersionReplaceDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/VersionReplaceDialog/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                baselineList: [],
                panelUnfold: true,
                tableHeight: window.innerHeight - 190,
                formData: {
                    baselineMode: '1',
                    baseline: ''
                },
                baselineOptions: [],
                loadingBaselineList: false,
                selectedRelateObjects: [],
                lastRoute: null,
                // 收集对象
                collectForm: {
                    visible: false,
                    title: '',
                    loading: false,
                    tableData: [],
                    className: CONSTS?.className
                },
                // 添加对象
                objectForm: {
                    visible: false,
                    urlConfig: (vm) => {
                        const data = ErdcKit.deepClone(vm?.defaultUrlConfig?.data) || {};
                        data?.conditionDtoList?.push({
                            attrName: `${vm.className}#iterationInfo.state`,
                            oper: 'NE',
                            value1: 'CHECKED_OUT'
                        });
                        return {
                            data: {
                                ...data
                            }
                        };
                    },
                    excluded: []
                },
                checkOutOid: null,
                loading: false
            };
        },
        watch: {
            baselineList: {
                immediate: true,
                handler: function (nv) {
                    this.objectForm.excluded = _.map(nv, (item) => {
                        const row =
                            _.find(item?.attrRawList, (item) => new RegExp('identifierNo$').test(item?.attrName)) || {};
                        return row?.value || '';
                    });
                }
            }
        },
        async created() {
            this.loadSelectedData();
            await this.handleBaselineSearch();
            if (this.baselineOptions.length > 0) {
                this.formData.baseline = this.baselineOptions.at(0).oid;
            }
        },
        beforeRouteEnter(to, from, next) {
            next((vm) => {
                vm.lastRoute = vm.lastRoute || {
                    path: from?.path,
                    name: from?.name,
                    params: from?.params,
                    query: from?.query
                };
            });
        },
        methods: {
            ...mapMutations(['setSelectedForAdd']),
            // 选中收集对象
            collectObjectClick() {
                // 选中的收集对象数据
                let tableData = this.$refs?.collectObjectsRef?.getData?.() || [];

                // 当前勾选的相关对象数据
                const selectedData = this.selectedRelateObjects || [];

                if (tableData.length) {
                    for (let i = tableData.length - 1; i >= 0; i--) {
                        for (let j = 0; j < selectedData.length; j++) {
                            if (tableData[i]?.oid === selectedData[j]?.oid) {
                                tableData.splice(i, 1);
                            }
                        }
                    }
                }

                if (tableData.length) {
                    this.collectForm.loading = true;

                    tableData = _.map(tableData, (item) => {
                        let obj = {};
                        _.each(item?.attrRawList, (sitem) => {
                            obj[sitem.attrName] = sitem?.displayName;
                        });

                        return {
                            ...obj,
                            ...item,
                            ...{ collect: true }
                        };
                    });

                    this.baselineList = this.baselineList.concat(tableData);

                    this.$message.success(this.i18n['收集相关对象成功']);

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                } else {
                    this.collectForm.loading = true;

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                }
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            // 收集相关对象
            collectRelatedObjects(tableData) {
                if (!tableData.length) {
                    return this.$message.info(this.i18n['请勾选对象']);
                }
                this.popover({
                    field: 'collectForm',
                    visible: true,
                    title: this.i18n['收集相关对象'],
                    callback: () => {
                        this.collectForm.tableData = ErdcKit.deepClone(tableData) || [];
                    }
                });
            },
            loadSelectedData() {
                const selectedData = this.getSelectedForAdd();
                if (selectedData.length === 0) {
                    return;
                }
                const oidList = selectedData.map((item) => item.oid);
                // oid -> OR:erd.cloud.cbb.doc.entity.EtDocument:1701522576877088769
                const className = oidList.at(0).split(':').at(1);
                return this.$famHttp({
                    url: '/fam/search/by/oid',
                    method: 'post',
                    data: {
                        className,
                        oidList
                    }
                }).then((resp) => {
                    const {
                        success,
                        data: { relationObjMap = {}, records = [] }
                    } = resp;
                    if (success) {
                        this.baselineList = records.map((item) => {
                            return {
                                ...item,
                                ...ErdcKit.deserializeArray(item.attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                }),
                                createBy:
                                    relationObjMap[`OR:erd.cloud.foundation.principal.entity.User:${item.createBy}`]
                                        ?.displayName || item.createBy,
                                updateBy:
                                    relationObjMap[`OR:erd.cloud.foundation.principal.entity.User:${item.updateBy}`]
                                        ?.displayName || item.updateBy
                            };
                        });
                    }
                });
            },
            handleAssociationDone: function (data) {
                const needAddList = data.filter(
                    (item) => this.baselineList.findIndex((sItem) => sItem.oid === item.oid) < 0
                );
                this.baselineList.splice(this.baselineList.length, 0, ...needAddList);
            },
            handleExistedBaselineModeConfirm() {
                return new Promise((resolve) => {
                    this.$refs.baseFormRef.validate((valid) => {
                        if (valid) {
                            const selectedBaseline = this.baselineOptions.find(
                                (item) => item.oid === this.formData.baseline
                            );
                            resolve(selectedBaseline);
                        }
                    });
                });
            },
            async handleCreateBaselineModeConfirm() {
                try {
                    const formSubmitResult = await this.$refs.baselineFormRef.submit();
                    let appName = this.appName || cbbUtils.getAppNameByResource();
                    if (formSubmitResult.validate) {
                        this.loading = true;
                        const createResp = await this.$famHttp({
                            url: '/baseline/create',
                            className: CONSTS.className,
                            appName,
                            data: {
                                isDraft: false,
                                ...formSubmitResult.data
                            },
                            method: 'post'
                        }).catch(() => {
                            this.loading = false;
                        });
                        if (createResp.success) {
                            return {
                                oid: createResp.data,
                                name:
                                    formSubmitResult.data.attrRawList.find((item) => item.attrName === 'name')?.value ||
                                    ''
                            };
                        } else {
                            this.loading = false;
                        }
                    }
                } catch (e) {}
            },
            handleCheckout(oid) {
                this.loading = true;
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    className: CONSTS.className,
                    params: {
                        oid
                    }
                }).catch(() => {
                    this.loading = false;
                });
            },
            // 替换版本确认
            handleReplaceSubmit(data, callback) {
                if (!data.length) {
                    callback && callback();
                    return this.$message.warning(this.i18n.selectTip);
                }
                let selectedBaseline = this.baselineOptions.find((item) => item.oid === this.formData.baseline);

                let params = {
                    baselineRef: this.checkOutOid || selectedBaseline.oid || '',
                    name: selectedBaseline.name,
                    confirm: true,
                    memberDtoList: data.map((item) => ({
                        memberOid: item.versionValue,
                        name: item.name,
                        number: item.number,
                        objectRef: item.versionOption.find((v) => {
                            return v.oid == item.versionValue;
                        })?.masterRef,
                        version: item.versionOption.find((v) => {
                            return v.oid == item.versionValue;
                        })?.label
                    }))
                };
                this.handleConfirm(selectedBaseline, params, callback);
            },
            async handleConfirm(baseline, paramsData, callback) {
                const data = paramsData
                    ? paramsData
                    : {
                          baselineRef: baseline.oid,
                          name: baseline.name,
                          confirm: false,
                          memberDtoList: this.baselineList.map((item) => ({
                              memberOid: item.collect ? item.versionOid : item.oid, //通过收集相关对象收集而来的oid不符合此参数
                              name: item.name,
                              objectRef: item.masterRef,
                              version: item.version,
                              number: item.identifierNo
                          }))
                      };
                if (!this.isCreateBaselineMode && !this.checkOutOid) {
                    //新建基线无需检出 || 非检入状态的现有基线无需检出
                    const iterationInfoState =
                        _.find(baseline?.attrRawList || [], (item) =>
                            new RegExp('iterationInfo.state$').test(item?.attrName)
                        ) || {};
                    if (iterationInfoState?.value === CHECKED_IN_TYPE) {
                        let resp = await this.handleCheckout(data.baselineRef);
                        if (resp?.success) {
                            let oid = resp?.data?.rawData?.oid?.value || '';
                            this.checkOutOid = data.baselineRef = oid; //传入检出后的oid
                        } else {
                            this.loading = false;
                        }
                    }
                }
                this.loading = true;
                this.$famHttp({
                    url: '/baseline/member/add',
                    className: CONSTS.className,
                    data,
                    method: 'POST'
                })
                    .then((resp) => {
                        if (resp.success) {
                            callback && callback(true);
                            if (_.isEmpty(resp.data)) {
                                this.$message.success(this.i18n.addToBaselineSuccess);
                                // 添加至基线不返回原来的页面，直接跳转到对应基线详情的相关对象页签
                                // this.handleClose();
                                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                    const { prefixRoute, resourceKey } = this.$route?.meta || {};
                                    this.$router.push({
                                        path: `${prefixRoute.split(resourceKey)[0]}erdc-baseline/baseline/detail`,
                                        query: {
                                            ..._.pick(this.$route.query, (value, key) => {
                                                return ['pid', 'typeOid'].includes(key) && value;
                                            }),
                                            oid: data.baselineRef,
                                            activeName: 'relationObj'
                                        }
                                    });
                                });
                            } else {
                                // 如已经有不同版本的对象再表格咯,就弹出是否覆盖的弹窗
                                this.$refs?.versionReplaceDialogRef?.open(resp.data);
                            }
                            this.setSelectedForAdd([]);
                        } else {
                            callback && callback();
                        }
                    })
                    .catch(() => {
                        callback && callback();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            async handleConfirmBtnClick() {
                if (this.baselineList.length === 0) {
                    return this.$message.error(this.i18n.pleaseAddBaseline);
                }
                const baselineInfo = await (this.isCreateBaselineMode
                    ? this.handleCreateBaselineModeConfirm()
                    : this.handleExistedBaselineModeConfirm());
                baselineInfo && this.handleConfirm(baselineInfo);
            },
            handleClose() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    if (this.lastRoute && this.lastRoute.name) {
                        return this.$router.push(this.lastRoute);
                    }
                    if (visitedRoutes.length) {
                        return this.$router.push(visitedRoutes.at(0));
                    }
                    return this.$router.push(this.$store.state.route.resources.children[0].href);
                });
            },
            handleBaselineSearch(query = '') {
                return new Promise((resolve) => {
                    this.baselineOptions = [];
                    this.loadingBaselineList = true;
                    const data = {
                        className: CONSTS.className,
                        pageIndex: 1,
                        pageSize: 100
                    };
                    if (query) {
                        data.conditionDtoList = [
                            {
                                attrName: 'name',
                                oper: 'LIKE',
                                value1: query,
                                logicalOperator: 'AND',
                                isCondition: true
                            }
                        ];
                    }

                    let appName = this.appName || cbbUtils.getAppNameByResource();
                    this.$famHttp({
                        url: '/baseline/search',
                        data,
                        method: 'POST',
                        appName
                    })
                        .then((resp) => {
                            this.loadingBaselineList = false;
                            if (resp.success) {
                                let result = resp.data.records;
                                this.baselineOptions = result
                                    .filter((e) => e.accessToView)
                                    .map((item) => ({
                                        ...item,
                                        ...ErdcKit.deserializeArray(item.attrRawList, {
                                            valueKey: 'displayName',
                                            isI18n: true
                                        })
                                    }));
                            } else {
                                this.baselineOptions = [];
                            }
                            resolve(this.baselineOptions);
                        })
                        .catch(() => {
                            resolve([]);
                        });
                });
            },
            handleRelateObjectAdd() {
                this.popover({
                    field: 'objectForm',
                    visible: true
                });
            },
            handleRelateObjectGather() {
                const selectedRelateObjects = ErdcKit.deepClone(this.selectedRelateObjects) || [];
                this.collectRelatedObjects(selectedRelateObjects);
            },
            handleSelectedRelateObjectRemove() {
                if (!this.selectedRelateObjects.length) {
                    return this.$message.info(this.i18n.selectTip);
                }

                this.$confirm(this.i18n.removeTip, this.i18n.tip, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    customClass: 'confirm-message-tips',
                    type: 'warning'
                })
                    .then(() => {
                        const baselineList = ErdcKit.deepClone(this.baselineList) || [];
                        for (let i = baselineList.length - 1; i >= 0; i--) {
                            for (let j = 0; j < this.selectedRelateObjects.length; j++) {
                                if (baselineList[i]?.oid === this.selectedRelateObjects[j]?.oid) {
                                    baselineList.splice(i, 1);
                                }
                            }
                        }
                        this.baselineList = baselineList;
                        this.selectedRelateObjects = [];
                    })
                    .catch(() => {});
            },
            handleRelateObjectRemove(data) {
                this.$confirm(this.i18n.removeTip, this.i18n.tip, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    customClass: 'confirm-message-tips',
                    type: 'warning'
                })
                    .then(() => {
                        this.baselineList = this.baselineList.filter((item) => item.oid !== data.row.oid);
                    })
                    .catch(() => {});
            },
            handleSelectionAll() {
                this.selectedRelateObjects = this.$refs.erdTable.$table.getCheckboxRecords();
            },
            handleSelectionChange() {
                this.selectedRelateObjects = this.$refs.erdTable.$table.getCheckboxRecords();
            }
        },
        computed: {
            ...mapGetters(['getSelectedForAdd']),
            rules() {
                return {
                    baseline: [{ required: true, message: this.i18n.pleaseSelectBaseline, trigger: 'blur' }]
                };
            },
            pageTitle() {
                return {
                    isShowTag: false,
                    title: this.i18n.addToBaseline,
                    isShowPulldown: false,
                    staticTitle: true
                };
            },
            pid() {
                return this.$route.query?.pid;
            },
            isCreateBaselineMode() {
                return this.formData.baselineMode === '2';
            },
            columns() {
                return [
                    {
                        type: 'checkbox', // 特定类型
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        title: this.i18n.code,
                        prop: 'identifierNo'
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n.context
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n.lifecycleStatus
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version
                    },
                    {
                        prop: 'createBy',
                        title: this.i18n.createdBy
                    },
                    {
                        prop: 'createTime',
                        title: this.i18n.createTime
                    },
                    {
                        prop: 'updateTime',
                        title: this.i18n.updateTime
                    },
                    {
                        prop: 'updateBy',
                        title: this.i18n.updatedBy
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operate,
                        width: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                    }
                ];
            }
        }
    };
});
