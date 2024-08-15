// 替换  ADD,REMAIN,remove ,UPDATE,添加,保持不变,删除,更新
define([
    'text!' + ELMP.resource('erdc-pdm-components/ReplaceManagement/index.html'),
    ELMP.resource('erdc-pdm-components/ReplaceManagement/store.js'),
    ELMP.resource('erdc-pdm-components/ReplaceManagement/actions.js')
], function (template, store) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('ReplaceManagement', store);
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('ReplaceManagement');

    return {
        name: 'ReplaceManagement',
        template,
        components: {
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
        },
        props: {
            className: [String],
            info: [Object],
            // 全局视图表格请求需要的参数
            globalRelationshipRef: [String],
            // 局部视图表格请求需要的参数
            localRelationshipRef: [String],
            // 全局视图表格需要的tableKey
            globalTableKey: {
                type: String,
                default: 'ManageAlternateView'
            },
            // 局部视图表格需要的tableKey
            localTableKey: [String],
            // 全局视图表格需要的按钮请求参数
            globalActionConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 局部视图表格需要的按钮请求参数
            localActionConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 局部特定部件信息
            // 规则:名称+编码+版本
            getParentPartInfo: {
                type: Function
            },
            // 是否开启直接提交,不开启的话先操作数据,然后再手动调handleSubmit去提交
            isOpenSubmit: {
                type: Boolean,
                default: true
            },
            // 局部表格不同场景下需要的参数
            localTableParams: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 跳转详情的地址
            detailAddress: {
                type: String,
                default: 'erdc-part/part/detail'
            },
            detailCallback: [Function],
            handleHeader: [Function]
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/ReplaceManagement/locale/index.js'),
                globalBaseInfoUnfold: true,
                localBaseInfoUnfold: true,
                options: [],
                type: '',
                operWay: '',
                globalData: [],
                localData: [],
                globalSelect: [],
                localSelect: [],
                visible: false
            };
        },
        computed: {
            ...mapGetters(['getMapping']),
            tableKey() {
                return this.getMapping({ mappingName: 'tableKeyMap', className: this.className });
            },
            associationColumns() {
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'icon',
                        title: '',
                        width: '38'
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n?.['编码']
                    },
                    {
                        prop: 'name',
                        title: this.i18n?.['名称']
                    },
                    {
                        prop: 'version',
                        title: this.i18n?.['版本']
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n?.['生命周期']
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n?.['上下文']
                    }
                ];
            },
            urlConfig() {
                const _this = this;
                return {
                    mmethd: 'POST',
                    url: '/fam/view/table/page',
                    data: {
                        className: _this.className,
                        tableKey: _this.tableKey,
                        conditionDtoList: [
                            // 排除自身,不能添加自身,局部添加排除父级
                            {
                                attrName: `${_this.className}#identifierNo`,
                                oper: 'NOT_IN',
                                value1: [_this.info?.identifierNo]
                                    .concat(
                                        _this.operWay == 'localAdd' &&
                                            _this.getParentPartInfo &&
                                            _this.getParentPartInfo().identifierNo
                                            ? [_this.getParentPartInfo()?.identifierNo]
                                            : []
                                    )
                                    .join(',')
                            },
                            {
                                attrName: `${_this.className}#iterationInfo.state`,
                                oper: 'NOT_IN',
                                value1: ['CHECKED_OUT', 'WORKING'].join(',')
                            },
                            {
                                attrName: `${_this.className}#lifecycleStatus.status`,
                                oper: 'NOT_IN',
                                value1: ['DRAFT'].join(',')
                            },
                            {
                                attrName: `${_this.className}#typeReference`,
                                oper: 'EQ',
                                value1: _this.type
                            }
                        ]
                    }
                };
            },
            // 全局className
            globalSubstituteModule() {
                return this.$store.state.ReplaceManagement.globalSubstituteModule;
            },
            // 局部className
            localSubstituteModule() {
                return this.$store.state.ReplaceManagement.localSubstituteModule;
            },
            // 全局替代视图表格配置
            globalViewTableConfig() {
                const _this = this;
                let {
                    i18n,
                    handleMatchGlobalData,
                    globalActionConfig: actionConfig,
                    globalRelationshipRef: relationshipRef,
                    globalTableKey: tableKey
                } = _this;
                const method = 'POST';
                return {
                    tableKey,
                    viewMenu: {
                        showViewManager: false
                    },
                    tableConfig: {
                        vm: _this,
                        // 是否马上执行
                        firstLoad: true,
                        // 是否需要反序列化
                        isDeserialize: true,
                        searchParamsKey: 'searchKey',
                        sortParamsKey: 'orderBy', // 排序参数传递key
                        sortOrderParamsKey: 'sortBy',
                        sortByRequest: true,
                        headerRequestConfig: {
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    return resData;
                                }
                            ]
                        },
                        tableRequestConfig: {
                            method,
                            data: {
                                relationshipRef,
                                // 不过滤安全信息
                                deleteNoPermissionData: false
                            },
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    let { records } = resData.data;
                                    !_.isEmpty(records) && handleMatchGlobalData(records);
                                    return resData;
                                }
                            ]
                        },
                        // 插槽
                        slotsField: [
                            {
                                prop: 'icon',
                                type: 'default'
                            },
                            {
                                prop: `${this.globalSubstituteModule}#isTwoWay`,
                                type: 'default'
                            },
                            {
                                prop: `${this.globalSubstituteModule}#replacementType`,
                                type: 'default'
                            }
                        ],
                        toolbarConfig: {
                            valueKey: 'attrName',
                            fuzzySearch: {
                                placeholder: i18n['请输入编码或名称'],
                                show: true,
                                isLocalSearch: false, // 使用前端搜索
                                searchCondition: ['name', 'number'],
                                width: 250
                            },
                            actionConfig
                        },
                        // 编码跳转
                        fieldLinkConfig: {
                            linkClick: (row) => {
                                row?.accessToView && this.handleDetail(row);
                            }
                        },
                        tableBaseConfig: {
                            'rowConfig': {
                                isCurrent: true,
                                isHover: true,
                                keyField: 'oid'
                            },
                            'columnConfig': {
                                resizable: true // 是否允 许调整列宽
                            },
                            'showOverflow': true, // 溢出隐藏显示省略号

                            'checkbox-config': {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        tableBaseEvent: {
                            'checkbox-change': (data) => {
                                _this.handleCheckboxChange('global', data);
                            },
                            'checkbox-all': (data) => {
                                _this.handleCheckboxChange('global', data);
                            }
                        },
                        pagination: {
                            // 分页
                            showPagination: false // 是否显示分页
                        }
                    }
                };
            },
            // 局部替代视图表格配置
            localViewTableConfig() {
                const _this = this;
                let {
                    i18n,
                    handleMatchLocalData,
                    localActionConfig: actionConfig,
                    localRelationshipRef: relationshipRef,
                    localTableKey: tableKey,
                    getParentPartInfo,
                    localTableParams,
                    handleHeader
                } = _this;
                const method = 'POST';
                return {
                    tableKey,
                    viewMenu: {
                        showViewManager: false
                    },
                    tableConfig: {
                        vm: _this,
                        firstLoad: true,
                        // 是否需要反序列化
                        isDeserialize: true,
                        searchParamsKey: 'searchKey',
                        sortParamsKey: 'orderBy', // 排序参数传递key
                        sortOrderParamsKey: 'sortBy',
                        sortByRequest: true,
                        headerRequestConfig: {
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    handleHeader && handleHeader(resData);
                                    return resData;
                                }
                            ]
                        },
                        tableRequestConfig: {
                            data: {
                                deleteNoPermissionData: false,
                                relationshipRef,
                                // 有传递父节点信息的才需要这个参数
                                ...(getParentPartInfo && getParentPartInfo().oid
                                    ? { extendMessage: getParentPartInfo().oid }
                                    : {}),
                                ...(_.isEmpty(localTableParams) ? {} : localTableParams)
                            },
                            method,
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    let { records } = resData.data;
                                    !_.isEmpty(records) && handleMatchLocalData(records);
                                    return resData;
                                }
                            ]
                        },
                        slotsField: [
                            {
                                prop: 'icon',
                                type: 'default'
                            },
                            {
                                prop: `${this.localSubstituteModule}#replacementType`,
                                type: 'default'
                            },
                            {
                                prop: `${this.localSubstituteModule}#parentPart`,
                                type: 'default'
                            }
                        ],
                        toolbarConfig: {
                            valueKey: 'attrName',
                            fuzzySearch: {
                                placeholder: i18n['请输入编码或名称'],
                                show: true,
                                isLocalSearch: false, // 使用前端搜索
                                searchCondition: ['name', 'number'],
                                width: 250
                            },
                            actionConfig
                        },
                        // 编码跳转
                        fieldLinkConfig: {
                            linkClick: (row) => {
                                row?.accessToView && this.handleDetail(row);
                            }
                        },
                        tableBaseConfig: {
                            // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                            'rowConfig': {
                                isCurrent: true,
                                isHover: true,
                                keyField: 'oid'
                            },
                            'columnConfig': {
                                resizable: true // 是否允 许调整列宽
                            },
                            'showOverflow': true, // 溢出隐藏显示省略号

                            'checkbox-config': {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        tableBaseEvent: {
                            'checkbox-change': (data) => {
                                _this.handleCheckboxChange('local', data);
                            },
                            'checkbox-all': (data) => {
                                _this.handleCheckboxChange('local', data);
                            }
                        },
                        pagination: {
                            // 分页
                            showPagination: false // 是否显示分页
                        }
                    }
                };
            },
            // 插槽
            slotName() {
                return {
                    isTwoWay: `column:default:${this.globalSubstituteModule}#isTwoWay:content`,
                    replacementType: `column:default:${this.globalSubstituteModule}#replacementType:content`,
                    // 局部替换类型
                    localReplacementType: `column:default:${this.localSubstituteModule}#replacementType:content`,
                    parentPart: `column:default:${this.localSubstituteModule}#parentPart:content`
                };
            }
        },
        methods: {
            handleMatchGlobalData(data) {
                data.forEach((item) => {
                    item.action = 'REMAIN';
                    item.replacementType = 'overall';
                    item.isTwoWay =
                        item.attrRawList.find((item) => {
                            return item.attrName == `${this.globalSubstituteModule}#isTwoWay`;
                        })?.value || false;
                    // 如果是安全信息.是否双向的复选框也要禁用
                    item.disabled = !item.accessToView;
                });
                // 初始化表格缓存数据
                this.globalData = this.changeAddData(data);
            },
            handleMatchLocalData(data) {
                data.forEach((item) => {
                    item.action = 'REMAIN';
                    item.replacementType = 'partial';
                    // 如果是安全信息.是否双向的复选框也要禁用
                    item.disabled = !item.accessToView;
                    item.parentPart =
                        item.attrRawList.find((v) => {
                            return v.attrName == `${this.localSubstituteModule}#parentPart`;
                        })?.displayName || '';
                });
                this.localData = this.changeAddData(data);
            },
            // 刷新表格的方法
            refreshTable(ref) {
                this.$nextTick(() => {
                    this.$refs[ref].refreshTable();
                });
            },
            // 获取表格数据的方法
            getTableData(ref) {
                let tableData =
                    this.$refs[ref].$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.getTableData().fullData;
                return tableData;
            },
            // 重新加载表格数据,用于操作表格数据
            reloadTableData(ref, data) {
                this.$refs[ref].$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.reloadData(data);
            },
            handleCheckboxChange(type, event) {
                const _this = this;
                let typeMap = {
                    global: () => {
                        _this.globalSelect = event.records;
                    },
                    local: () => {
                        _this.localSelect = event.records;
                    }
                };
                typeMap[type]();
            },
            handleAfterRequest({ data, callback }) {
                const _this = this;
                let className = _this.className;
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
            getType() {
                const _this = this;
                _this
                    .$famHttp({
                        url: '/fam/type/typeDefinition/findAccessTypes',
                        data: {
                            typeName: _this.className,
                            containerRef: '',
                            subTypeEnum: 'ALL',
                            accessControl: false
                        },
                        method: 'GET'
                    })
                    .then((res) => {
                        _this.options = res?.data.map((v) => {
                            return {
                                ...v,
                                label: v.displayName,
                                value: v.typeOid
                            };
                        });
                        _this.type = _this.options[0].value;
                    });
            },
            handleChangeType(val) {
                const _this = this;
                _this.type = val;
            },
            handleChangeIsDB(row) {
                if (row.action == 'REMAIN') {
                    row.action = 'UPDATE';
                }
                this.globalData = this.getTableData('globalTable');
                if (this.isOpenSubmit) {
                    this.handleSubmit('global');
                } else {
                    this.reloadTableData('globalTable', this.globalData);
                }
            },
            handleAdd(type) {
                const _this = this;
                _this.getType();
                _this.visible = true;
                let operWayMap = {
                    global: 'globalAdd',
                    local: 'localAdd'
                };
                _this.operWay = operWayMap[type];
            },

            changeAddData(data) {
                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(this.className + '#') !== -1) {
                            obj[res.attrName] = res.displayName;
                        }
                    });
                    return { ...item, ...obj, checked: false };
                });
                return result;
            },
            // overall:全局
            // partial:局部
            // MUTUAL 是双向
            handleAssociationSubmit(data) {
                const _this = this;
                let result = _this.changeAddData(data);
                // 全局添加
                let operWayMap = {
                    globalAdd: () => {
                        let removedDataOids = _this.globalData
                            .filter((item) => item.action === 'REMOVE')
                            .map((item) => item.versionOid);

                        let list = result.map((item) => {
                            return {
                                ...item,
                                replacementType: 'overall',
                                isTwoWay: false,
                                action: removedDataOids.includes(item.oid) ? 'REMAIN' : 'ADD',
                                disabled: !item.accessToView,
                                versionOid: item.oid,
                                // 新加数据的标识
                                isNew: true
                            };
                        });
                        // _this.globalData = _this.getTableData('globalTable');
                        // 处理先移除再增加的情况
                        let addDataOids = list.map((item) => item.oid);
                        _this.globalData = _this.globalData.filter(
                            (item) => !(item.action === 'REMOVE' && addDataOids.includes(item.versionOid))
                        );

                        let hasOidMap = {};
                        _this.globalData = [..._this.globalData, ...list].reduce((arr, item) => {
                            hasOidMap[item.versionOid] ? '' : (hasOidMap[item.versionOid] = true && arr.push(item));
                            return arr;
                        }, []);
                        if (_this.isOpenSubmit) {
                            _this.handleSubmit('global');
                        } else {
                            let data = _this.globalData.filter((item) => item.action !== 'REMOVE');
                            _this.reloadTableData('globalTable', data);
                        }
                    },
                    localAdd: () => {
                        // 局部特定部件信息
                        let parentPartInfo = _this.getParentPartInfo() || {};
                        let parentPart = parentPartInfo?.caption || '';
                        let removedDataOids = _this.localData
                            .filter((item) => item.action === 'REMOVE')
                            .map((item) => item.versionOid);

                        let list = result.map((item) => {
                            return {
                                ...item,
                                replacementType: 'partial',
                                parentPart,
                                action: removedDataOids.includes(item.oid) ? 'REMAIN' : 'ADD',
                                disabled: !item.accessToView,
                                versionOid: item.oid,
                                // 新加数据的标识
                                isNew: true
                            };
                        });
                        // _this.localData = _this.getTableData('localTable');

                        // 处理先移除再增加的情况
                        let addDataOids = list.map((item) => item.oid);
                        _this.localData = _this.localData.filter(
                            (item) => !(item.action === 'REMOVE' && addDataOids.includes(item.versionOid))
                        );

                        let hasOidMap = {};
                        _this.localData = [..._this.localData, ...list].reduce((arr, item) => {
                            hasOidMap[item.versionOid] ? '' : (hasOidMap[item.versionOid] = true && arr.push(item));
                            return arr;
                        }, []);
                        if (_this.isOpenSubmit) {
                            _this.handleSubmit('local');
                        } else {
                            // 移除的数据不需要展示在表格
                            let data = _this.localData.filter((item) => item.action !== 'REMOVE');
                            _this.reloadTableData('localTable', data);
                        }
                    }
                };
                operWayMap[_this.operWay]();
            },
            // 删除
            handleDelete(type) {
                const _this = this;
                if (_.isEmpty(_this.globalSelect) && type == 'global') {
                    return _this.$message.info(_this.i18n['请先勾选数据']);
                }
                if (_.isEmpty(_this.localSelect) && type == 'local') {
                    return _this.$message.info(_this.i18n['请先勾选数据']);
                }
                let typeMap = {
                    global: () => {
                        // _this.globalData = _this.getTableData('globalTable');
                        _this.globalData.forEach((item) => {
                            _this.globalSelect.forEach((multip) => {
                                if (multip.oid === item.oid) {
                                    // 是否被删除的标识
                                    item.action = 'REMOVE';
                                }
                            });
                        });
                        if (_this.isOpenSubmit) {
                            _this.handleSubmit('global');
                        } else {
                            let data = _this.globalData.filter((item) => item.action !== 'REMOVE');
                            _this.reloadTableData('globalTable', data);
                        }
                        // 清空选择
                        _this.globalSelect = [];
                    },
                    local: () => {
                        // _this.localData = _this.getTableData('localTable');
                        _this.localData.forEach((item) => {
                            _this.localSelect.forEach((multip) => {
                                if (multip.oid === item.oid) {
                                    // 是否被删除的标识
                                    item.action = 'REMOVE';
                                }
                            });
                        });
                        if (_this.isOpenSubmit) {
                            _this.handleSubmit('local');
                        } else {
                            let data = _this.localData.filter((item) => item.action !== 'REMOVE');
                            _this.reloadTableData('localTable', data);
                        }
                        // 清空选择
                        _this.localSelect = [];
                    }
                };
                // 是否删除
                this.$confirm(_this.i18n['确认移除该数据'], _this.i18n['确认移除'], {
                    confirmButtonText: _this.i18n['确定'],
                    cancelButtonText: _this.i18n['取消'],
                    type: 'warning'
                }).then(() => {
                    typeMap[type]();
                });
            },
            // 提交前的数据处理
            handleGetSubmitData(type) {
                const _this = this;
                let result = [];
                let globalRoleAOid = '';
                let globalRoleBOid = '';
                let globalOid = '';
                let localRoleAOid = '';
                let localRoleBOid = '';
                let localOid = '';
                let parentOid = '';
                (type == 'all' || type == 'global') &&
                    _this.globalData.forEach((data) => {
                        // 判断data是新增项还是更新项_this.info.oid(部件详情)
                        if (data.action !== 'REMAIN') {
                            globalRoleAOid = _this.info?.masterRef;
                            globalRoleBOid = data.masterRef;
                            // 添加的时候,替代关系还没形成,所以没有替代关系的oid,更新和删除就有
                            globalOid = data.action == 'ADD' ? '' : data.oid || '';
                        }
                        data.action == 'REMAIN' || (data.action == 'REMOVE' && data.isNew)
                            ? ''
                            : result.push({
                                  action: data.action,
                                  scope: data.replacementType,
                                  roleBOid: globalRoleBOid,
                                  oid: globalOid,
                                  roleAOid: globalRoleAOid,
                                  isTwoWay: data.isTwoWay
                              });
                    });
                (type == 'all' || type == 'local') &&
                    _this.localData.forEach((data) => {
                        // 判断data是新增项还是更新项
                        if (data.action !== 'REMAIN') {
                            localRoleAOid = _this.info?.usageRef;
                            parentOid = _this.info.parentOid;
                            localRoleBOid = data.masterRef;
                            localOid = data.action == 'ADD' ? '' : data.oid || '';
                        }
                        data.action == 'REMAIN' || (data.action == 'REMOVE' && data.isNew)
                            ? ''
                            : result.push({
                                  action: data.action,
                                  scope: data.replacementType,
                                  roleBOid: localRoleBOid,
                                  oid: localOid,
                                  roleAOid: localRoleAOid,
                                  parentOid
                              });
                    });
                return result;
            },
            // 添加删除都调同个接口去玩
            handleSubmit(type, localCallback, globalCallback, bothCallback) {
                const _this = this;
                let data = _this.handleGetSubmitData(type);
                if (_.isEmpty(data)) {
                    return _this.$message.info(_this.i18n['暂无更改的数据']);
                }
                let operWayMap = {
                    global: (oid) => {
                        _this.refreshTable('globalTable');
                        _.isFunction(globalCallback) && globalCallback(oid);
                    },
                    local: (oid) => {
                        _this.refreshTable('localTable');
                        _.isFunction(localCallback) && localCallback(oid);
                    },
                    all: (oid) => {
                        // 共用的回调
                        _.isFunction(bothCallback) && bothCallback(oid);
                        // 局部回调
                        _.isFunction(localCallback) && localCallback(oid);
                        // 全局回调
                        _.isFunction(globalCallback) && globalCallback(oid);
                    }
                };
                this.$famHttp({
                    url: '/fam/substitute/operate',
                    data,
                    className: _this.className,
                    method: 'POST'
                }).then((resp) => {
                    this.$message.success(_this.i18n['提交成功']);
                    operWayMap[type](resp?.data || '');
                });
            },
            // 编码跳转
            handleDetail(row) {
                if (!row?.[this.className + '#' + 'oid']) return;
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}${this.detailAddress}`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: row?.[this.className + '#' + 'oid']
                    }
                });
                _.isFunction(this.detailCallback) && this.detailCallback();
            }
        }
    };
});
