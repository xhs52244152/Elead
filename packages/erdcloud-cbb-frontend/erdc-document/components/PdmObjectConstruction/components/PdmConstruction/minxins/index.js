/* 
结构操作方法,插入,删除
*/
define([], function () {
    const _ = require('underscore');
    return {
        data() {
            return {
                showReplaceDialog: false,
                options: [],
                type: '',
                operWay: ''
            };
        },
        mounted() {
            this.getType();
        },
        methods: {
            handleViewTypesList(list) {
                let data = list.filter((item) => {
                    return item.className == this.className;
                });
                return data;
            },
            // eslint-disable-next-line no-unused-vars
            actionClick(type) {
                return;
                // const eventClick = {
                //     // 删除子布局
                //     PDM_PART_STRUCT_REMOVE: this.removeStruct,
                //     // 插入新的
                //     PDM_PART_STRUCT_CREATE_USAGE: this.insertNew,
                //     // 插入现有的
                //     PDM_PART_STRUCT_SAVES: this.insertExisting,
                //     // 替换管理部件
                //     PDM_PART_STRUCT_SUBSTITUTE_PART: this.handleReplace
                // };
                // eventClick?.[type.name] && eventClick?.[type.name]();
            },
            /**
             *删除子结构(后端删除接口会自动检出其父节点)
             */
            removeStruct() {
                let usageLinkOidList = this.$refs.PdmConstruction.fnGetCurrentSelection().map((v) => v.oid);
                if (_.isEmpty(usageLinkOidList)) {
                    return this.$message.info(this.i18n['请先勾选数据']);
                }
                let data = {
                    className: this.className,
                    oidList: usageLinkOidList,
                    filterVo: {}
                };
                this.$confirm(this.i18n['此操作将会移除对应子项是否继续'], this.i18n['确认移除'], {
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                })
                    .then(() => {
                        this.$famHttp({
                            url: '/fam/struct/deleteByIds',
                            data,
                            className: this.className,
                            method: 'POST'
                        }).then((res) => {
                            let { success } = res || {};
                            if (success) {
                                this.$message.success(this.i18n['移除成功']);
                                // 如果是根节点插入现有的,那要跟新attr接口和树接口
                                if (this.oid == this.rootData.oid) {
                                    // 刷新详情页（拿到检出后得oid）
                                    // 父节点永远是单选
                                    Object.values(res.data).forEach((v) => {
                                        this.$emit('refresh', v?.rawData?.oid?.value);
                                    });
                                } else {
                                    // 如果不是根节点的话,就只要更新树接口
                                    // 父节点永远是单选
                                    Object.values(res.data).forEach((v) => {
                                        this.$emit('refreshNode', v);
                                    });
                                }
                                this.refreshTable();
                                // 刷新树结构
                            } else {
                                this.$message.error(this.i18n['移除失败']);
                            }
                        });
                    })
                    .catch(() => { });
            },
            /**
             *插入(后端会自动检出父节点)
             */
            // 插入新的
            insertNew() {
                let selectData = this.$refs.PdmConstruction.fnGetCurrentSelection();
                if (selectData && selectData.length > 1) {
                    return this.$message.info(this.i18n['一次只能一个子节点后面']);
                }
                let className = this.oid.split(':')[1];
                let classNameMap = {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': this.handleToPartCreate,
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': this.handleToDocumentCreate
                };
                classNameMap[className]();
            },
            handleToPartCreate() {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/create`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        // 根节点oid
                        rootOid: this.rootData?.oid,
                        // 是否是根节点插入新的,如果是根节点就拿插入完的oid,如果不是就拿现有的oid
                        isRoot: this.rootData?.oid == this.oid,
                        // 要插入得父节点oid
                        parentOid: this.oid,
                        brotherMasterOid:
                            this.$refs.PdmConstruction.fnGetCurrentSelection()
                                .map((item) => item.relationOid)
                                .join(',') || '',
                        isNotNeedDraf: true
                    }
                });
            },
            handleToDocumentCreate() {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/create`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        // 根节点oid
                        rootOid: this.rootData?.oid,
                        isRoot: this.rootData?.oid == this.oid,
                        // 要插入得父节点oid
                        parentOid: this.oid,
                        brotherMasterOid:
                            this.$refs.PdmConstruction.fnGetCurrentSelection()
                                .map((item) => item.relationOid)
                                .join(',') || '',
                        isNotNeedDraf: true,
                        status: '',
                        title: '创建文档'
                    }
                });
            },
            // 插入现有的
            async insertExisting() {
                let $table = this.$refs.PdmConstruction.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable;
                let selectData = this.$refs.PdmConstruction.fnGetCurrentSelection();
                let tableData = $table.getTableData()?.tableData;
                if (selectData && selectData.length > 1) {
                    return this.$message.info(this.i18n['一次只能一个子节点后面']);
                }
                // 插入到指定节点后面
                const record = {
                    // 标识是新插入的
                    isNew: true
                };
                let place = -1;
                // 插到最后
                if (
                    (selectData && selectData.length == 0) ||
                    selectData[0].oid == tableData[tableData.length - 1].oid
                ) {
                    place = -1;
                } else {
                    let index = 0;
                    index = tableData.findIndex((item) => {
                        return selectData[0].oid == item.oid;
                    });
                    place = tableData[index + 1];
                }
                const { row: newRow } = await $table.insertAt(record, place);
                await $table.setEditCell(newRow, this.nameAttClass);
            },
            // 真正插入的方法,单个插入和批量插入
            insertNewWay(oldOid, createOids, brotherMasterOid) {
                return new Promise((resolve) => {
                    let data = {
                        brotherMasterOid,
                        childOidList: createOids,
                        filterVo: {},
                        parentOid: oldOid
                    };
                    this.$famHttp({
                        url: '/fam/struct/batch-create-byIds',
                        data,
                        className: this.className,
                        method: 'POST'
                    }).then((res) => {
                        let { success } = res || {};
                        if (success) {
                            this.$message.success(this.i18n['插入成功']);
                            // 插入后,更新树
                            resolve(res.data);
                        }
                    });
                });
            },
            handleChooseObject() {
                this.visible = true;
                this.operWay = 'inserNew';
            },
            // 插入现有的方法
            handleCallback(data) {
                if (this.editRow && !this.editRow?.isNew) {
                    this.handleReplaceNode(data[0].oid, this.editRow.oid).then((res) => {
                        data.visible = false;
                        // 如果是根节点插入现有的,那要跟新attr接口和树接口
                        if (this.oid == this.rootData.oid) {
                            // 刷新详情页（拿到检出后得oid）
                            this.$emit('refresh', res?.rawData?.oid?.value);
                        } else {
                            // 如果不是根节点的话,就只要更新树接口
                            this.$emit('refreshNode', res);
                        }
                        this.refreshTable();
                    });
                    return;
                }
                // 插入新得
                let oidList = data.map((v) => v.oid);
                let selectOid =
                    this.$refs.PdmConstruction.fnGetCurrentSelection()
                        .map((item) => item.relationOid)
                        .join(',') || '';
                this.insertNewWay(this.oid, oidList, selectOid).then((res) => {
                    data.visible = false;
                    // 如果是根节点插入现有的,那要跟新attr接口和树接口
                    if (this.oid == this.rootData.oid) {
                        // 刷新详情页（拿到检出后得oid）
                        this.$emit('refresh', res?.rawData?.oid?.value);
                    } else {
                        // 如果不是根节点的话,就只要更新树接口
                        this.$emit('refreshNode', res);
                    }
                    this.refreshTable();
                });
            },
            // 替换已有子节点
            handleReplaceNode(partOid, usageLinkOid) {
                return new Promise((resolve) => {
                    let data = {
                        oid: usageLinkOid,
                        partOid
                    };
                    this.$famHttp({
                        url: '/fam/struct/substitute',
                        data,
                        className: this.className,
                        method: 'POST'
                    }).then((res) => {
                        let { success } = res || {};
                        if (success) {
                            this.$message.success(this.i18n['替换成功']);
                            // 插入后,更新树
                            resolve(res.data);
                        }
                    });
                });
            },
            /**
             *替换
             */
            getType() {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    data: {
                        typeName: this.className,
                        containerRef: '',
                        accessControl: false
                    },
                    method: 'GET'
                }).then((res) => {
                    let { success } = res || {};
                    if (success) {
                        this.options = res?.data.map((v) => {
                            return {
                                ...v,
                                label: v.displayName,
                                value: v.typeOid
                            };
                        });
                        this.type = this.options[0].value;
                    }
                });
            },
            handleChangeType(val) {
                this.type = val;
            },
            handleReplace() {
                const _this = this;
                // let selectData = this.$refs.PdmConstruction.fnGetCurrentSelection();
                // if (selectData.length == 0) {
                //     return this.$message.info('请至少勾选一个结构');
                // }
                // if (selectData && selectData.length > 1) {
                //     return this.$message.info('替代关系不能多选');
                // }
                _this.showReplaceDialog = true;
            },
            // 弹窗提交
            handleSubmit() {
                let data = this.$refs.ReplaceManagement.handleGetSubmitData();
                this.$famHttp({
                    url: '/fam/substitute/operate',
                    data,
                    className: this.className,
                    method: 'POST'
                }).then((res) => {
                    let { success } = res || {};
                    if (success) {
                        // 插入后,更新树
                        this.showReplaceDialog = false;
                        this.$message.success(this.i18n['提交成功']);
                    }
                });
            },
            // 穿梭框提交方法
            handleAssociationSubmit(data) {
                const _this = this;
                // 全局添加
                let operWayMap = {
                    inserNew: () => {
                        _this.handleCallback(data);
                    }
                };
                operWayMap[_this.operWay]();
            },
            // 检出部件对象
            hanldeCheckout(parentOid) {
                const _this = this;
                let data = {
                    filterVo: {},
                    order: {},
                    parentOid
                };
                this.$famHttp({
                    url: '/fam/struct/checkout',
                    className: _this.className,
                    data,
                    method: 'POST'
                }).then((res) => {
                    let { success } = res || {};
                    if (success) {
                        // 如果是根元素的话,就要更新对象,更新树形控件
                        if (this.rootData?.oid == parentOid) {
                            this.$emit('refresh', res?.data?.rawData?.oid?.value);
                        } else {
                            // 如果不是根节点的话,就只要更新树接口
                            this.$emit('refreshNode', res.data);
                        }
                        this.refreshTable();
                    }
                });
            },
            // // 跳转详情
            handleDetail(data) {
                if (!data.accessToView) {
                    return;
                }
                let className = data.versionOid.split(':')[1];
                let classNameMap = {
                    // // 部件
                    // 'erd.cloud.pdm.part.entity.EtPart': this.handleToPartDetail,
                    // 文档
                    'erd.cloud.cbb.doc.entity.EtDocument': this.handleToDocumentDetail,
                    'erd.cloud.pdm.epm.entity.EpmDocument': this.handleToEpmDcumentDetail
                };
                classNameMap[className](data, className);
            },
            // handleToPartDetail(data) {
            //     this.$router.push({
            //         name: `${this.$route?.meta?.parentPath}/partDetail`,
            //         params: {
            //             oid: data.versionOid
            //         }
            //     });
            //     EventBus.emit('refresh:structure', { ...data, ...{ oid: data.versionOid } });
            // },
            handleToDocumentDetail(data, className) {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: data.versionOid,
                        activeName: 'structure',
                        className,
                        title: '查看文档'
                    }
                });
            },
            handleToEpmDcumentDetail(data, className) {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/detail`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: data.versionOid,
                        activeName: 'structure',
                        className
                    }
                });
            }
        }
    };
});
