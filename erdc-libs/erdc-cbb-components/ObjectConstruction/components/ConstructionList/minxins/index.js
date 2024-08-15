/* 
结构操作方法,插入,删除
*/
define([
    'erdc-kit',
    ELMP.resource('erdc-pdm-common-actions/utils.js'),
    ELMP.resource('erdc-pdm-components/ConfirmDialog/index.js')
], function (FamKit, utils, confirmDialog) {
    return {
        data() {
            return {
                showReplaceDialog: false,
                options: [],
                type: '',
                operWay: '',
                // bom视图弹窗
                showBomViewDialog: false,
                loading: false,
                // 创建成功后的bomViewOid
                bomViewOid: null,
                insertWay: '',
                typeReference: '',
                typeName: this.className
            };
        },
        mounted() {
            this.getType();
        },
        methods: {
            urlConfig(vm) {
                let defaultUrl = FamKit.deepClone(vm.defaultUrlConfig);

                // 子类型条件参数
                let typeReferenceCondition =
                    defaultUrl.data.conditionDtoList.find((item) => item.attrName.includes('typeReference')) || {};

                defaultUrl.data.conditionDtoList = [
                    {
                        attrName: `${this.className}#lifecycleStatus.status`,
                        oper: 'NE',
                        value1: 'DRAFT',
                        sortOrder: 9
                    },
                    {
                        attrName: `${this.className}#iterationInfo.state`,
                        isCondition: true,
                        logicalOperator: 'AND',
                        oper: 'EQ',
                        sortOrder: 0,
                        value1: 'CHECKED_IN'
                    }
                ];

                // 组装子类型条件参数
                if (!_.isEmpty(typeReferenceCondition)) {
                    defaultUrl.data.conditionDtoList.push(typeReferenceCondition);
                }

                return defaultUrl;
            },
            handleViewTypesList(list) {
                let data = list.filter((item) => {
                    return item.className == this.className;
                });
                return data;
            },
            /**
             *删除子结构
             */
            removeStruct() {
                let usageLinkOidList = this.$refs.ConstructionList.fnGetCurrentSelection().map((v) => v.oid);
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
                            url: '/part/bom/remove',
                            data,
                            className: this.className,
                            method: 'POST'
                        }).then((res) => {
                            let { success } = res || {};
                            if (success) {
                                this.$message.success(this.i18n['移除成功']);
                                // 如果是根节点插入现有的,那要跟新attr接口和树接口
                                // if (this.oid == this.rootData.oid) {
                                //     // 刷新详情页（拿到检出后得oid）
                                //     // 父节点永远是单选
                                //     Object.values(res.data).forEach((v) => {
                                //         this.$emit('refresh', v?.rawData?.oid?.value);
                                //     });
                                // } else {
                                //     // 如果不是根节点的话,就只要更新树接口
                                //     // 父节点永远是单选
                                //     Object.values(res.data).forEach((v) => {
                                //         this.$emit('refreshNode', v);
                                //     });
                                // }
                                // 更新某个节点，没有检入检出的逻辑了
                                this.$emit('refreshNode', this.info);
                                this.refreshTable();
                                // 刷新树结构
                            } else {
                                this.$message.error(this.i18n['移除失败']);
                            }
                        });
                    })
                    .catch(() => {});
            },
            /**
             *插入
             */
            /* 
            插入前要校验有没有bomview:
            1.,没有bomView的时候,弹出一个创建bom视图的弹窗,让创建,之后再进行插入操作
            2.有bomview的话就照常创建 
            */
            insertBeforeCheck(callback, type) {
                // 有视图代表有bomView
                if (_.isEmpty(this.viewConfig?.view)) {
                    this.handleShowBomView();
                    // 插入的方式
                    this.insertWay = type;
                } else {
                    callback && callback();
                }
            },
            // 插入新的
            insertNew() {
                // 插入前检查是否有bomView
                this.insertBeforeCheck(this.handleToPartCreate, 'NEW');
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
                        // 要插入得父节点oid
                        parentOid: this.info?.oid,
                        bomViewOid: this.bomViewOid || this.viewConfig.view,
                        brotherMasterOid:
                            this.$refs.ConstructionList.fnGetCurrentSelection()
                                .map((item) => item.relationOid)
                                .join(',') || '',
                        isNotNeedDraf: true
                    }
                });
            },
            // 插入现有的
            insertExisting() {
                // 插入前检查是否有bomView
                this.insertBeforeCheck(this.insertExistingPlace, 'EXIST');
            },
            async insertExistingPlace() {
                let $table = this.$refs.ConstructionList.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable;
                let selectData = this.$refs.ConstructionList.fnGetCurrentSelection();
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
                        parentOid: oldOid,
                        bomViewOid: this.bomViewOid || this.viewConfig.view //切换的视图的bomviewOid
                    };
                    this.$famHttp({
                        url: '/part/bom/create',
                        data,
                        className: this.className,
                        method: 'POST'
                    }).then((res) => {
                        let { success } = res || {};
                        if (success) {
                            this.$message.success(this.i18n['插入成功']);
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
                // 替换现有的子结构
                if (this.editRow && !this.editRow?.isNew) {
                    this.handleReplaceNode(data[0].oid, this.editRow.oid).then(() => {
                        data.visible = false;
                        this.$emit('refreshNode', this.info);
                        this.refreshTable();
                    });
                    return;
                }
                // 选择后,插入新得子结构
                let oidList = data.map((v) => v.oid);
                let selectOid =
                    this.$refs.ConstructionList.fnGetCurrentSelection()
                        .map((item) => item.relationOid)
                        .join(',') || '';
                this.insertNewWay(this.info?.oid, oidList, selectOid).then(() => {
                    data.visible = false;
                    this.bomViewOid = null;
                    this.$emit('refreshNode', this.info);
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
                        this.typeReference = this.type;
                    }
                });
            },
            handleChangeType(val) {
                this.type = val;
                this.typeReference = val;
            },
            handleReplace() {
                const _this = this;
                // let selectData = this.$refs.ConstructionList.fnGetCurrentSelection();
                // if (selectData.length == 0) {
                //     return this.$message.info('请至少勾选一个结构');
                // }
                // if (selectData && selectData.length > 1) {
                //     return this.$message.info('替代关系不能多选');
                // }
                _this.showReplaceDialog = true;
            },
            handleReplaceDetailCallback() {
                this.showReplaceDialog = false;
            },
            // 弹窗提交
            handleSubmit() {
                const _this = this;
                // oid,点击确定后,后端给的oid,可能是检出后的oid
                _this.$refs.ReplaceManagement.handleSubmit(
                    'all',
                    (oid) => {
                        _this.showReplaceDialog = false;
                        if (!_.isEmpty(oid)) {
                            if (_this.getParentInfo().oid == _this.rootData?.oid) {
                                _this.$emit('refresh');
                                _this.vm.componentRefresh();
                                // 需要拿到检出后的oid
                                this.$router.replace({
                                    path: this.$route.path,
                                    query: {
                                        ..._.pick(this.$route.query, (value, key) => {
                                            return ['pid', 'typeOid'].includes(key) && value;
                                        }),
                                        oid,
                                        activeName: 'structure'
                                    }
                                });
                            } else {
                                this.$emit('refreshNode', _this.getParentInfo());
                            }
                        }
                    },
                    () => {},
                    () => {
                        let data = _this.showData.filter((item) => {
                            return item.parentOid == _this.info.oid;
                        });
                        if (!_.isEmpty(data)) {
                            _this.refreshSubstitutePartFunction('PDM_PART_STRUCT_DISPLAY_SUBSTITUTE', false);
                        }
                    }
                );
            },
            // 穿梭框
            handleAfterRequest({ data, callback }) {
                let className = this.className;
                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
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
            // 替换部件
            handleReplacePart() {
                // 替换前数据
                let data = this.getParentInfo();
                if (data.oid == this.rootData.oid) {
                    return this.$message.info(this.i18n['根节点不允许替换']);
                    // this.i18n['提交成功']
                }
                // 获取替换前和替换后的部件信息
                const props = {
                    visible: true,
                    type: 'base',
                    className: this.className,
                    width: '800px',
                    title: this.i18n['确认替换'],
                    confirmTitle: this.i18n['确认替换该数据'],
                    tips: this.i18n['替换信息如下'],
                    rowList: [
                        {
                            beforeReplaceName: data?.caption,
                            beforeReplaceIdentifierNo: data?.identifierNo,
                            beforeReplaceContainerRef: data?.containerRef?.displayName,
                            beforeReplaceVersion: data?.caption.split(',')[2],
                            afterReplaceName: this.info?.caption,
                            afterReplaceIdentifierNo: this.info?.identifierNo,
                            afterReplaceVersion: this.info?.version,
                            afterReplaceContainerRef: this.info?.rawData?.containerRef?.displayName
                        }
                    ],
                    columns: [
                        {
                            prop: 'beforeReplaceName', // 属性key
                            title: this.i18n['替换前部件名称'], // 属性名称,
                            width: '200'
                        },
                        {
                            prop: 'beforeReplaceIdentifierNo', // 属性key
                            title: this.i18n['编码'], // 属性名称
                            width: '180'
                        },
                        {
                            prop: 'beforeReplaceContainerRef', // 属性key
                            title: this.i18n['上下文'], // 属性名称
                            width: '180'
                        },
                        {
                            prop: 'beforeReplaceVersion', // 属性key
                            title: this.i18n['版本'], // 属性名称
                            width: '100'
                        },
                        {
                            prop: 'afterReplaceName', // 属性key
                            title: this.i18n['替换后对象名称'], // 属性名称
                            width: '200'
                        },
                        {
                            prop: 'afterReplaceIdentifierNo', // 属性key
                            title: this.i18n['编码'], // 属性名称
                            width: '180'
                        },

                        {
                            prop: 'afterReplaceContainerRef', // 属性key
                            title: this.i18n['上下文'], // 属性名称
                            width: '180'
                        },
                        {
                            prop: 'afterReplaceVersion', // 属性key
                            title: this.i18n['版本'], // 属性名称
                            width: '100'
                        }
                    ]
                };

                utils.mountHandleDialog(confirmDialog, {
                    props,
                    successCallback: () => {
                        let params = {
                            idKey: this.info?.idKey,
                            partOid: this.info?.oid,
                            currentPartOid: data?.oid,
                            linkOid: data?.usageRef
                        };
                        this.$famHttp({
                            url: '/part/struct/substitute',
                            data: params,
                            method: 'POST',
                            className: this.className
                        }).then((res) => {
                            let { success } = res || {};
                            if (success) {
                                // 刷新树结构
                                this.$emit('refresh');
                            }
                        });
                    }
                });
            },

            /*
            BOM视图 
             */
            showBomViewCheck(callback) {
                let viewNameList = [];
                // 过滤父级已有视图
                this.viewConfig.options.forEach((item) => {
                    viewNameList.push(item.name);
                });
                // 从有效视图中过滤
                this.filterViewlist = this.allViewOptions.filter((item) => {
                    return !viewNameList.includes(item.name);
                });
                if (_.isEmpty(this.filterViewlist)) {
                    return this.$message.info(this.i18n['视图已创建完']);
                }
                callback && callback();
            },
            handleShowBomView() {
                const _this = this;
                _this.showBomViewCheck(() => {
                    _this.showBomViewDialog = true;
                });
            },
            // 创建BON视图
            handleSubmitBomForm() {
                const _this = this;
                let insertMap = {
                    NEW: this.handleToPartCreate,
                    EXIST: this.insertExistingPlace
                };
                let data = {
                    filterVo: {},
                    parentOid: this.info?.oid,
                    ..._this.$refs.bomViewForm.getFormData()
                };
                _this.$refs.bomViewForm.handleSubmitForm(() => {
                    _this.loading = true;
                    _this
                        .$famHttp({
                            url: '/part/bom/createBomView',
                            method: 'post',
                            data,
                            className: _this.className
                        })
                        .then((res) => {
                            let { code, data } = res;
                            if (code == 200) {
                                _this.showBomViewDialog = false;
                                _this.$message.success('创建成功');
                                // 创建成功后执行下一步操作
                                setTimeout(() => {
                                    _this.bomViewOid = data.oid;
                                    !_.isEmpty(_this.insertWay) && insertMap[_this.insertWay]();
                                }, 1000);
                                // 创建成功后，重新请求数据
                                _this.getObjectView(_this.info);
                                // 如果是根节点创建bom视图，就需要刷新根节点
                                if (_this.info?.oid == _this.rootData?.oid) {
                                    _this.$emit('refreshObjectView', _this.rootData);
                                }
                                if (_.isEmpty(_this.viewConfig.options)) {
                                    // 创建第一个视图成功后还要刷新一下操作按钮
                                    _this.refreshOperBtnFunction();
                                }
                            } else {
                                _this.$message.warning('创建失败');
                                // 取消的时候
                                _this.bomViewOid = null;
                            }
                        })
                        .finally(() => {
                            _this.loading = false;
                        });
                });
            },
            // 跳转详情
            handleDetail(data) {
                if (!data.accessToView) {
                    return;
                }
                let className = data.versionOid.split(':')[1];
                let classNameMap = {
                    // 部件
                    'erd.cloud.pdm.part.entity.EtPart': this.handleToPartDetail
                };
                classNameMap[className](data, className);
            },
            handleToPartDetail(data) {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: data.versionOid
                    }
                });
            }
        }
    };
});
