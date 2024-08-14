define([
    'text!' + ELMP.resource('erdc-ppm-products/views/list/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-products/views/list/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-ppm-products/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    confirmInvalidation: this.getI18nByKey('confirmInvalidation'),
                    confirmInvali: this.getI18nByKey('confirmInvali'),
                    confirmPublish: this.getI18nByKey('confirmPublish'),
                    confirmPublishData: this.getI18nByKey('confirmPublishData'),
                    publishWorkTip: this.getI18nByKey('publishWorkTip'),

                    treeTitle: this.getI18nByKey('productInfo'),

                    draftSuccess: this.getI18nByKey('draftSuccess'),
                    createdSuccessfully: this.getI18nByKey('createdSuccessfully'),
                    editSuccessfully: this.getI18nByKey('editSuccessfully'),
                    editProduct: this.getI18nByKey('editProduct'),
                    createProduct: this.getI18nByKey('createProduct'),

                    invalidWorkTip: this.getI18nByKey('invalidWorkTip'),
                    success: this.getI18nByKey('success'),
                    deleteWork: this.getI18nByKey('deleteWork')
                },
                left: {
                    width: '280px',
                    minWidth: 200,
                    maxWidth: '50%'
                },
                formDialogTitle: '创建产品',
                showMoveDialog: false,
                showFormDialog: false,
                treeDetail: {},
                oid: '',
                layoutName: 'CREATE',
                currentSelectTreeData: '',
                currentOid: ''
            };
        },
        created() {},
        computed: {
            className() {
                return store.state.classNameMapping.businessProductInfo;
            }
        },
        methods: {
            handleNodeClick(val) {
                this.treeDetail = val;
                this.oid = val.oid;
                this.currentSelectTreeData = val;
            },
            handleOperate(type, data) {
                this.currentSelectTreeData = data || {};
                const eventClick = {
                    handleDelete: this.handleDelete, // 删除
                    handleCreate: this.handleCreate, // 创建
                    handleMove: this.handleMove, // 移动
                    handleEdit: this.handleEdit, // 编辑
                    handleEfficacy: this.handleEfficacy // 失效
                };
                eventClick?.[type.methodsName] && eventClick?.[type.methodsName](data, 1);
            },
            handleDelete(val) {
                this.$alert(
                    `<div><p style="display: flex;color: #000000d9"><i style="color: #e6a23c; padding-right: 8px; font-size: 24px;" class="el-icon-warning"></i>${this.i18nMappingObj['confirmDelete']}</p> <p style="font-size: 12px; font-weight: 500;color: #606266;margin-left: 36px;margin-top: 8px;">${this.i18nMappingObj['deleteWork']}</p></div>`,

                    this.i18nMappingObj['deleteTip'],
                    {
                        showCancelButton: true,
                        dangerouslyUseHTMLString: true
                    }
                )
                    .then(() => {
                        this.$famHttp({
                            url: '/cbb/delete',
                            method: 'DELETE',
                            className: this.className,
                            params: {
                                oid: val.oid
                            }
                        }).then((resp) => {
                            if (resp.code === '200') {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj['success']
                                });
                                this.$refs.systemProductTree?.getListTree();
                            }
                        });
                    })
                    .catch(() => {
                        this.$message({
                            type: 'info',
                            message: this.i18nMappingObj['cancel']
                        });
                    });
            },
            handleEfficacy(val) {
                let status = this.i18nMappingObj[val.status === 'release' ? 'confirmInvalidation' : 'confirmPublish'];
                let statusTitle =
                    this.i18nMappingObj[val.status === 'release' ? 'confirmInvali' : 'confirmPublishData'];
                let tips = this.i18nMappingObj[val.status === 'release' ? 'invalidWorkTip' : 'publishWorkTip'];
                this.$alert(
                    `<div><p style="display: flex;color: #000000d9"><i style="color: #e6a23c; padding-right: 8px; font-size: 24px;" class="el-icon-warning"></i>${status}</p> </div>`,
                    statusTitle,
                    {
                        showCancelButton: true,
                        dangerouslyUseHTMLString: true
                    }
                )
                    .then(() => {
                        this.$famHttp({
                            url: '/cbb/productInfo/invalidOrActive',
                            method: 'POST',
                            data: {
                                // 参数customParam: release为失效，参数customParam: inactive为生效
                                customParam: val.status,
                                oid: val.oid,
                                className: this.className
                            }
                        }).then((resp) => {
                            if (resp.code === '200') {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj['success']
                                });
                                this.$refs.systemProductTree?.getListTree(val.oid);
                                this.$refs.systemProductDetail?.refreshBasic();
                            }
                        });
                    })
                    .catch(() => {
                        this.$message({
                            type: 'info',
                            message: this.i18nMappingObj['cancel']
                        });
                    });
            },
            beforeSubmit(data, next, draft) {
                let defaulf = 'OR:erd.cloud.cbb.pbi.entity.ProductInfo:-1';
                data?.attrRawList.some((el) => {
                    if (el.attrName === 'nameI18nJson') {
                        el.value = {
                            value: el.value.value?.trim() || '',
                            zh_cn: el.value.value?.trim() || '',
                            en_us: el.value.en_us?.trim() || ''
                        };
                    }
                    if (el.attrName === 'description') {
                        el.value = el.value?.trim() || '';
                    }
                    if (el.attrName === 'type') {
                        if (!data.oid) {
                            el.value = el.value.identifierNo;
                        }
                    }
                    if (el.attrName === 'parentRef') {
                        if (data.oid) {
                            el.value = this.currentSelectTreeData?.parentKey || defaulf;
                        } else {
                            // 创建
                            el.value = this.currentSelectTreeData?.oid || defaulf;
                        }
                        // el.value = el.value.oid;
                    }
                });

                data.attrRawList = _.filter(data.attrRawList, (item) => item.value);

                let tip = draft ? this.i18nMappingObj['draftSuccess'] : this.i18nMappingObj['createdSuccessfully'];
                if (data.oid) tip = this.i18nMappingObj['editSuccessfully'];
                if (draft) {
                    data.customParam = draft === 'inactive' ? 'inactive' : 'draft';
                } else {
                    data.customParam = 'release';
                }

                next(data, draft, tip);
            },
            afterSubmit(val) {
                this.$refs.systemProductTree?.getListTree(val?.data);
                this.$refs.systemProductDetail?.refreshBasic();
            },
            // 回显数据处理
            echoData(val, cb) {
                let data = ErdcKit.deserializeAttr(val, {
                    valueMap: {
                        nameI18nJson: (e, data) => {
                            return data['nameI18nJson']?.value || '';
                        },
                        parentRef: (e, data) => {
                            return data['parentRef']?.oid || '';
                        },
                        type: (e, data) => {
                            return data['type']?.value || '';
                        }
                    }
                });

                cb(data);
            },
            handleMove(val) {
                this.showMoveDialog = true;
                this.oid = val.oid;
            },
            //isCommon存在 代表是通过公共方法handleOperate调用
            handleEdit(val, isCommon) {
                if (!isCommon) {
                    val.level = val.parentRef ? val.parentRef : 1;
                }
                val.parentKey = this.currentSelectTreeData.parentKey;
                this.currentSelectTreeData = val || {};
                this.oid = val.oid;
                this.showFormDialog = true;
                this.layoutName = 'UPDATE';
                this.formDialogTitle = this.i18nMappingObj['editProduct'];
                this.currentOid = val.oid;
            },
            handleCreate(val) {
                this.layoutName = 'CREATE';
                this.oid = '';
                this.currentOid = val?.oid || '';
                this.showFormDialog = true;
                this.formDialogTitle = this.i18nMappingObj['createProduct'];
            }
        },
        components: {
            SystemTree: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SystemDefineTree/index.js')),
            SystemDefineDetail: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/index.js')
            ),
            SystemDialogForm: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/SystemDialogForm/index.js')
            ),
            MoveDialog: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/MoveDialog/index.js')),
            // 拖拽布局
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        }
    };
});
