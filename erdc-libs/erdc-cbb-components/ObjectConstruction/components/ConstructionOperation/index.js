/**
 * @description 结构操作组件
 */
define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionOperation/index.html'),
    ELMP.func('erdc-baseline/baselineSdk.js'),
    ELMP.func('erdc-part/components/PartCreateViewVersion/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionOperation/actions.js'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionOperation/store.js'),
    'css!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionOperation/index.css')
], function (template, baselineSdk, CreateViewVersionForm, commonActions) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('ConstructionOperation');

    return {
        name: 'ConstructionOperation',
        template,
        components: {
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        props: {
            info: [Object],
            // 根节点数据
            rootData: [Object],
            // 父节点实例
            vm: [Object],
            className: [String],
            // 对象已有视图选项
            viewOptions: {
                type: Array,
                default() {
                    return [];
                }
            },
            getTreeData: [Function]
        },
        data() {
            return {
                i18nPath: ELMP.resource(
                    'erdc-cbb-components/ObjectConstruction/components/ConstructionOperation/locale/index.js'
                ),
                remarks: '',
                // 实例本身
                self: null
            };
        },
        computed: {
            ...mapGetters(['getStructuredMapping']),
            operationClassNameMap() {
                return this.getStructuredMapping({
                    mappingName: 'operationClassNameMap',
                    className: this.className
                });
            },
            constructionEditData() {
                return this.$store.getters['ConstructionList/getConstructionEditData'];
            },
            constructionTableRefresh() {
                return this.$store.getters['ConstructionList/getRefreshConstructionTable'];
            },
            constructionTableCheck() {
                return this.$store.getters['ConstructionList/getConstructionTableCheck'];
            },
            getPreferenceView() {
                return this.$store.state.ObjectConstruction.preferenceView;
            },
            // 视图
            viewConfig() {
                return {
                    view: this.viewOptions[0]?.value,
                    options: this.viewOptions,
                    label: '视图',
                    disabled: this.viewOptions.length < 2,
                    showComponent: 'erd-ex-select'
                };
            }
            // sizer() {
            //     return {
            //         value: '1',
            //         options: [
            //             {
            //                 value: '1',
            //                 label: '设计'
            //             },
            //             {
            //                 value: '2',
            //                 label: '制造'
            //             }
            //         ],

            //         label: '筛选器',
            //         showComponent: 'erd-ex-select'
            //     };
            // }
        },
        mounted() {
            this.self = this;
            // 存刷新操作按钮的方法
            this.$store.commit('ConstructionOperation/setRefreshOperBtnFunction', this.getCheckDataButtonData);
            this.$store.commit('ConstructionOperation/setSubstitutePartFunction', this.handleShow);
        },
        methods: {
            getActionConfig() {
                return {
                    name: this.operationClassNameMap,
                    objectOid: this.info?.oid,
                    className: this.info?.oid ? this.info?.oid?.split(':')[1] : ''
                };
            },
            getCheckDataButtonData() {
                this.$famHttp({
                    url: '/fam/menu/query',
                    method: 'POST',
                    data: {
                        name: this.operationClassNameMap,
                        objectOid: this.info?.oid,
                        className: this.info?.oid ? this.info?.oid?.split(':')[1] : ''
                    }
                }).then((res) => {
                    let famActionButton = this.$refs.famActionButton;
                    const { actionLinkDtos } = res.data || {};
                    const buttonGroup = ErdcKit.structActionButton(actionLinkDtos);
                    famActionButton.setButtonGroup(buttonGroup);
                });
            },
            async handleSave() {
                const checkList = await this.constructionTableCheck();
                if (!_.isEmpty(checkList)) {
                    return this.$message.error('数据校验不通过！');
                }
                if (_.isEmpty(this.constructionEditData)) {
                    return this.$message.info(this.i18n['暂无可保存的数据']);
                }
                let loading = this.$loading({
                    body: true,
                    fullscreen: true,
                    lock: true
                });
                // 调起保存弹窗
                this.handleSaveSubmit(loading);
            },
            handleSaveSubmit(loading) {
                const _this = this;
                let data = {
                    className: _this.info.oid.split(':')[1],
                    filterVo: {},
                    oidList: [_this.info.oid],
                    usageLinkVoList: _this.constructionEditData
                };
                _this
                    .$famHttp({
                        url: '/part/bom/save',
                        className: _this.info.oid.split(':')[1],
                        data,
                        method: 'POST'
                    })
                    .then((res) => {
                        let { success, message } = res || {};
                        if (success) {
                            // 关闭弹窗
                            loading.close();
                            message ? _this.$message.success(message) : _this.$message.success(_this.i18n['保存成功']);
                            // 保存成功,清除掉保存的结构编辑数据
                            _this.$store.commit('ConstructionList/setConstructionEditData', []);
                            _this.constructionTableRefresh();
                        } else {
                            loading.close();
                            _this.$message.error(_this.i18n['保存失败']);
                        }
                    })
                    .finally(() => {
                        loading.close();
                    });
            },
            handleToBaseline() {
                let dataList = this.vm.$refs.constructionTree.getAllNodes().map((v) => {
                    return v.data;
                });
                //  添加至基线
                baselineSdk.goBaselineAddPage(dataList);
            },
            handleDisPlayNone() {
                this.$emit('removeNode');
            },
            handleShow(name, isNeedTip = true) {
                let typeMap = {
                    PDM_PART_STRUCT_DISPLAY_ALL: 'all',
                    PDM_PART_STRUCT_DISPLAY_DOCUMENT: 'doc',
                    PDM_PART_STRUCT_DISPLAY_SUBSTITUTE: 'substitute'
                };
                let data = {
                    masterOidList: [this.info?.masterRef],
                    linkList: [this.rootData?.oid == this.info?.oid ? '' : this.info?.usageRef],
                    // oidList: this.rootData?.oid == this.info?.oid ? [] : [this.info?.usageRef],
                    // partOidList: [this.info?.oid],
                    root: this.info?.oid,
                    typeIds: [typeMap[name]]
                };
                this.$famHttp({
                    url: '/fam/struct/link/getByTypeIds',
                    className: this.info.oid.split(':')[1],
                    data,
                    method: 'POST'
                }).then((res) => {
                    let { success } = res || {};
                    if (success) {
                        if (!_.isEmpty(res.data)) {
                            //执行插入树的方法
                            this.$emit('appendToNode', this.changeShowData(res.data));
                        } else {
                            this.$emit('appendToNode', []);
                            isNeedTip && this.$message.info(this.i18n['暂无数据']);
                        }
                    }
                });
            },
            changeShowData(data) {
                let changeData = [];
                Object.values(data).forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        item[key].forEach((v) => {
                            changeData.push({
                                ...ErdcKit.deserializeAttr(v?.rawData, {
                                    // 需要单独处理得属性
                                    valueMap: {
                                        'lifecycleStatus.status'({ displayName, value }) {
                                            return {
                                                displayName,
                                                value
                                            };
                                        },
                                        'containerRef'({ displayName, oid }) {
                                            return {
                                                displayName,
                                                oid
                                            };
                                        }
                                    }
                                }),
                                ...v
                            });
                        });
                    });
                });
                return changeData;
            },
            handleViewFilterCondition(item) {
                return item;
            },
            // 创建视图版本(针对于根节点的转视图操作,永远针对根节点)
            handleCreatViewVersion() {
                commonActions.mountHandleDialog(CreateViewVersionForm, {
                    props: {
                        ['root-data']: this.rootData,
                        ['filter-view-list']: this.viewOptions
                    },
                    successCallback: ({ view }) => {
                        let data = {
                            bomViewOid: this.viewConfig.view,
                            branchVid: this.rootData.vid,
                            // 旧视图的oid
                            brotherMasterOid: this.viewOptions.find((item) => {
                                return item.value == this.viewConfig.view;
                            }).viewOid,
                            childOidList: [],
                            filterVo: {},
                            parentOid: this.rootData.oid,
                            viewOid: view
                        };
                        this.$famHttp({
                            url: '/part/bom/createView',
                            data,
                            method: 'POST',
                            className: this.className
                        }).then((res) => {
                            let { success, data } = res || {};
                            if (success) {
                                this.$confirm(this.i18n['是否跳转到转视图任务列表'], data, {
                                    confirmButtonText: this.i18n['确定'],
                                    cancelButtonText: this.i18n['取消'],
                                    type: 'warning'
                                }).then(() => {
                                    let appName = 'erdc-portal-web';
                                    let targetPath = '/biz-import-export/myImportExport';
                                    let query = {
                                        activeTabName: 'ViewConvertTaskList'
                                    };
                                    // 不同应用需要window.open，同应用直接push
                                    if (window.__currentAppName__ === appName) {
                                        this.$router.push({
                                            path: targetPath,
                                            query
                                        });
                                    } else {
                                        // path组装query参数
                                        let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                                        window.open(url, appName);
                                    }
                                });
                            }
                        });
                    }
                });
            },

            handleViewChange() {
                // 切换视图时需要刷新整颗树
                this.$emit('refreshTree');
            },
            handleSizerChange() {},
            // 部件-结构比较
            openConstructCompare(path) {
                this.$router.push({
                    path: `${this.$route.meta.prefixRoute}/${path}`,
                    query: {
                        pid: this.$route.query?.pid,
                        compareA: this.rootData?.oid,
                        compareB: ''
                    }
                });
            },
            handleBatchDownLoad() {
                let data = [];
                data = this.getTreeData() || [];
                let successCallback = () => {};
                commonActions.batchDownload(data, this.className, successCallback);
            }
        }
    };
});
