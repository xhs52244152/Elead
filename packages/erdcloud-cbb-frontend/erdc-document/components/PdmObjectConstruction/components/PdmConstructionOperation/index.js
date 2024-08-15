/**
 * @description 结构操作组件
 */
define([
    'text!' +
        ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstructionOperation/index.html'),
    ELMP.func('erdc-baseline/baselineSdk.js'),
    ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstructionOperation/store.js'),
    ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstructionOperation/actions.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    'css!' + ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstructionOperation/index.css')
], function (template, baselineSdk, store, actions, commonActions) {
    const ErdcKit = require('erdc-kit');
    const TreeUtil = require('TreeUtil');
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('PdmConstructionOperation', store);
    ErdcStore.dispatch('registerActionMethods', actions);
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('PdmConstructionOperation');

    return {
        name: 'PdmConstructionOperation',
        template,
        components: {
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            DialogSave: ErdcKit.asyncComponent(ELMP.func('erdc-document/components/DialogSave/index.js'))
        },
        props: {
            info: [Object],
            // 根节点数据
            rootData: [Object],
            // 父节点实例
            vm: [Object],
            className: [String]
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                remarks: '',
                visible: false
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
                return this.$store.getters['PdmConstruction/getConstructionEditData'];
            },
            constructionTableRefresh() {
                return this.$store.getters['PdmConstruction/getRefreshConstructionTable'];
            }
        },
        methods: {
            getActionConfig() {
                return {
                    name: this.operationClassNameMap,
                    objectOid: this.info?.oid,
                    className: this.info?.oid ? this.info?.oid?.split(':')[1] : ''
                };
            },
            handleSave() {
                if (this.constructionEditData.length == 0 && this.info['iterationInfo.state'] !== 'WORKING') {
                    return this.$message.info('暂无需保存');
                }
                // 调起保存弹窗
                this.visible = true;
            },
            handleSaveSubmit() {
                const _this = this;
                let data = {
                    className: _this.info.oid.split(':')[1],
                    // classNameTest: this.info.oid.split(':')[1],
                    filterVo: {},
                    oidList: [_this.info.oid],
                    remarks: _this.$refs.dialogSave.note,
                    usageLinkVoList: _this.constructionEditData
                };
                _this
                    .$famHttp({
                        url: '/fam/struct/checkin',
                        // url: '/part-yhl/struct/checkin',
                        className: _this.info.oid.split(':')[1],
                        data,
                        method: 'POST'
                    })
                    .then((res) => {
                        let { success } = res || {};
                        if (success) {
                            // 关闭弹窗
                            _this.$message.success(_this.i18n['检入成功']);
                            // 保存成功,清除掉保存的结构编辑数据
                            _this.$store.commit('PdmConstruction/setConstructionEditData', []);
                            _this.constructionTableRefresh();
                            // 刷新详情页（拿到检出后得oid）
                            if (_this.info?.oid == _this.rootData?.oid) {
                                // 刷新详情页（拿到检出后得oid）
                                _this.$emit('refresh', res?.data[_this.info.oid]?.rawData?.oid?.value);
                            } else {
                                // 如果不是根节点的话,就只要更新树接口
                                _this.$emit('refreshNode', res?.data[_this.info.oid]);
                            }
                            _this.visible = false;
                        } else {
                            _this.$message.error(_this.i18n['检入失败']);
                        }
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
            handleShow(name) {
                let typeMap = {
                    PDM_PART_STRUCT_DISPLAY_ALL: 'all',
                    PDM_PART_STRUCT_DISPLAY_DOCUMENT: 'doc',
                    PDM_PART_STRUCT_DISPLAY_SUBSTITUTE: 'substitute'
                };
                let data = {
                    oidList: this.rootData?.oid == this.info?.oid ? [] : [this.info?.usageLinkOid],
                    partOidList: [this.info?.oid],
                    root: this.rootData?.oid == this.info?.oid ? this.info?.oid : '',
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
                            this.$message.info(this.i18n['暂无数据']);
                        }
                    }
                });
            },
            changeShowData(data) {
                let changeData = [];
                Object.values(data).forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        item[key].forEach((v) => {
                            v.accessToView = false;
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
            handleBatchDownLoad() {
                let structuredClassNameMap = {
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': 'erd.cloud.cbb.doc.entity.EtDocumentUsageLink',
                    // 图文档
                    'erd.cloud.pdm.epm.entity.EpmDocument': 'erd.cloud.pdm.epm.entity.EpmMemberLink'
                };
                let data = [];
                data = TreeUtil.flattenTree2Array([this.rootData]).map((item) => {
                    return {
                        oid: item?.rawData?.oid?.value
                    };
                });
                let successCallback = () => {};
                commonActions.batchDownload(data, structuredClassNameMap[this.className], successCallback);
            }
        }
    };
});
