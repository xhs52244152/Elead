define([
    'text!' + ELMP.func('erdc-document/views/list/index.html'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.func('erdc-document/api.js')
], function (template, viewConfig, Api) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'DocumentList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js')),
            BatchSetValue: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/BatchSetValue/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                vm: this,
                setValue: {
                    visible: false,
                    tableData: []
                }
            };
        },
        computed: {
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            className() {
                return viewConfig?.docViewTableMap?.className || '';
            },
            viewTableConfig() {
                let config = {
                    // 视图表格定义的内部名称
                    tableKey: 'DocumentView',
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: this,
                        actionCustomParams: {
                            inTable: true,
                            isBatch: true
                        },
                        tableRequestConfig: {
                            url: '/document/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: {
                                containerRef: this.$route.query.pid ? this.containerRef : ''
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'DOC_LIST_OPERATE', //操作按钮的内部名称
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                className: this.className, //维护到store里
                                skipValidator: true
                            }
                        },
                        tableBaseConfig: {
                            checkboxConfig: {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                        },
                        slotsField: this.slotsField,
                        fieldLinkConfig: {
                            linkClick: (row) => {
                                row?.accessToView && this.handleDetail(row);
                            }
                        }
                    }
                };
                return config;
            },
            slotsField() {
                return [
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: `${this.className}#mainContent`,
                        type: 'default'
                    }
                ];
            },
            slotName() {
                return {
                    mainContent: `column:default:${this.className}#mainContent:content`
                };
            }
        },
        activated() {
            this.refresh();
        },
        methods: {
            setValueSuccess() {
                this.setValue.tableData = [];
                this.setValue.visible = false;
                this.refresh();
            },
            // 获取选中数据
            getSelectedData() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {};
                return fnGetCurrentSelection();
            },
            // 详情
            handleDetail(row) {
                if (!row.oid) return;

                const attrName = 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status';
                let lifecycleStatus = row.attrRawList.find((item) => item.attrName === attrName);
                /**
                 * 如果是草稿就跳转到编辑页面
                 */
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                if (lifecycleStatus && lifecycleStatus.value === 'DRAFT') {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/edit`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid,
                            className: this.className
                        }
                    });
                } else {
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid,
                            className: this.className,
                            title: '查看文档'
                        }
                    });
                }
            },
            getActionConfig(row) {
                return {
                    name: 'DOC_LIST_PER_OP_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            // 刷新表格
            refresh() {
                this.$refs.famViewTable?.getTableInstance('advancedTable', 'refreshTable')('default');
            },
            checkout(row) {
                let attrRawList = row.attrRawList || [];
                let iterationInfoState = attrRawList.find(
                    (i) => i.attrName === `${this.className}#iterationInfo.state`
                );
                if (iterationInfoState && iterationInfoState.value === 'CHECKED_IN') {
                    let className = row.oid?.split(':')?.[1];
                    return this.$famHttp({
                        url: Api.checkout,
                        className,
                        params: {
                            oid: row.oid
                        }
                    });
                } else {
                    return Promise.resolve({ success: true, data: { rawData: { oid: { value: row.oid } } } });
                }
            },
            getMainContent(oid) {
                let className = oid?.split(':')?.[1];
                return this.$famHttp({
                    url: '/document/content/attachment/list',
                    className,
                    params: {
                        objectOid: oid,
                        roleType: 'PRIMARY'
                    }
                }).then((resp) => {
                    if (resp.success) {
                        if (resp.data.attachmentDataVoList && resp.data.attachmentDataVoList.length) {
                            return resp.data.attachmentDataVoList[0];
                        }
                    }
                    return null;
                });
            },
            // 编辑
            editAttach(row) {
                let self = this;
                self.getMainContent(row.oid).then((mainContent) => {
                    if (mainContent) {
                        self.$refs.filePreview.isSupportedEdit(mainContent.displayName).then((isSupported) => {
                            if (isSupported) {
                                self.checkout(row)
                                    .then((resp) => {
                                        self.refresh();
                                        return self.getMainContent(resp.data.rawData.oid.value).then((mainContent) => {
                                            if (mainContent) {
                                                mainContent.objectOid = resp.data.rawData.oid.value;
                                                return mainContent;
                                            }
                                        });
                                    })
                                    .then((mainContent) => {
                                        if (mainContent) {
                                            self.$refs.filePreview.edit({
                                                fileName: mainContent.displayName,
                                                oid: mainContent.objectOid,
                                                contentId: mainContent.id
                                            });
                                        }
                                    });
                            } else {
                                self.$message(self.i18n.noSupported);
                            }
                        });
                    }
                });
            },
            // 预览
            previewAttach(row) {
                let self = this;
                this.currentRow = row;
                self.getMainContent(row.oid)
                    .then((mainContent) => {
                        if (mainContent) {
                            mainContent.objectOid = row.oid;
                            return mainContent;
                        }
                    })
                    .then((mainContent) => {
                        if (mainContent) {
                            //url链接
                            if (mainContent.source == 1) {
                                window.open(mainContent.value);
                            } else {
                                self.$refs.filePreview.isSupportedEdit(mainContent.displayName).then((isSupported) => {
                                    if (isSupported) {
                                        self.$refs.filePreview.preview({
                                            fileName: mainContent.displayName,
                                            oid: mainContent.objectOid,
                                            contentId: mainContent.id
                                        });
                                    } else {
                                        self.$message(self.i18n.noSupported);
                                    }
                                });
                            }
                        }
                    });
            },
            switchToEdit() {
                this.editAttach(this.currentRow);
            }
        }
    };
});
