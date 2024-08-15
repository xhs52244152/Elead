/**
 * @description 结构组件
 */
define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/index.html'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/minxins/index.js'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/store.js'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/actions.js'),
    'css!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionList/index.css')
], function (template, operMinxin) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('ObjectConstruction');

    return {
        name: 'ConstructionList',
        template,
        mixins: [operMinxin],
        props: {
            // 对象oid
            oid: [String],
            // 对象className
            className: [String],
            // 根节点数据
            rootData: [Object],
            // 点击得父节点
            info: [Object],
            defaultView: [String],
            needBomView: {
                type: Boolean,
                default: true
            },
            getParentInfo: [Function],
            vm: [Object],
            showData: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            // 穿梭框组件
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            // 输入框搜索对象组件
            InputSearchObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InputSearchObject/index.js')),
            // 替换管理内容组件(部件才有替换)
            ReplaceManagement: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/ReplaceManagement/index.js')),
            // BOM视图创建编辑表单
            BomViewForm: ErdcKit.asyncComponent(
                ELMP.resource(
                    'erdc-cbb-components/ObjectConstruction/components/ConstructionList/components/BomViewForm/index.js'
                )
            ),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        data() {
            const lineNumberValid = (rule, cellValue) => {
                // 模拟服务端校验
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // 只能为正整数
                        var reg = /^[1-9]\d*$/;
                        if (!reg.test(cellValue)) {
                            reject(new Error('序号数据类型错误'));
                        } else {
                            resolve();
                        }
                    }, 100);
                });
            };
            const occurrencesValid = (rule, cellValue) => {
                // 模拟服务端校验
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // 允许数字,大小写字母,数值为空
                        var reg = /(^$)|^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/g;
                        if (!reg.test(cellValue)) {
                            reject(new Error('位号格式错误'));
                        } else {
                            resolve();
                        }
                    }, 100);
                });
            };
            const amountValid = (rule, cellValue) => {
                // 模拟服务端校验
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (_.isNaN(Number(cellValue)) || _.isEmpty(cellValue)) {
                            reject(new Error('数量数据类型错误'));
                        } else {
                            resolve();
                        }
                    }, 100);
                });
            };

            return {
                i18nPath: ELMP.resource(
                    'erdc-cbb-components/ObjectConstruction/components/ConstructionList/locale/index.js'
                ),
                formData: {},
                visible: false,
                // 这里也可以添加默认的插槽
                slotList: [],
                showInputSearchObject: false,
                structureData: [],
                displayData: [],
                editRow: {},
                editSaveData: [],
                validRules: {
                    // 行号
                    'erd.cloud.pdm.part.entity.EtPartUsageLink#lineNumber': [{ validator: lineNumberValid }],
                    // 位号
                    'erd.cloud.pdm.part.entity.EtPartUsageLink#occurrences': [{ validator: occurrencesValid }],
                    // 数量
                    'erd.cloud.pdm.part.entity.EtPartUsageLink#amount': [{ validator: amountValid }]
                },
                viewConfig: {
                    view: '',
                    options: [],
                    showComponent: 'erd-ex-select',
                    disabled: false
                },
                allViewOptions: [],
                filterViewlist: [],
                buttonList: []
            };
        },
        watch: {
            info: {
                handler(newVal) {
                    if (newVal) {
                        if (this.needBomView && !_.isEmpty(this.info)) {
                            this.getObjectView(this.info);
                        }
                    }
                },
                deep: true,
                immediate: true
            }
        },
        computed: {
            /*
            一系列动态匹配的参数
            */
            ...mapGetters(['getStructuredMapping']),
            structuredClassName() {
                return this.getStructuredMapping({ mappingName: 'structuredClassNameMap', className: this.className });
            },
            structuredTableKey() {
                return this.getStructuredMapping({ mappingName: 'structuredTableKeyMap', className: this.className });
            },
            nameAttClass() {
                return this.getStructuredMapping({ mappingName: 'nameAttClassMap', className: this.className });
            },
            identifierNoAttClass() {
                return this.getStructuredMapping({ mappingName: 'identifierNoAttClassMap', className: this.className });
            },
            actionConfigKey() {
                return this.getStructuredMapping({ mappingName: 'actionConfigMap', className: this.className });
            },
            tableKey() {
                return this.getStructuredMapping({ mappingName: 'tableViewKeyMap', className: this.className });
            },
            module() {
                return this.getStructuredMapping({ mappingName: 'moduleMap', className: this.className });
            },
            replaceClassName() {
                return this.$store.state.ObjectConstruction.classNameMapping.replaceClassName;
            },
            condition() {
                return [
                    {
                        attrName: `${this.className}#iterationInfo.state`,
                        isCondition: true,
                        logicalOperator: 'AND',
                        oper: 'EQ',
                        sortOrder: 0,
                        value1: 'CHECKED_IN'
                    }
                ];
            },
            viewTableConfig() {
                const _this = this;
                let { i18n } = this;
                return {
                    tableKey: _this.structuredTableKey,
                    viewMenu: {
                        showViewManager: false
                    },
                    tableConfig: {
                        vm: _this,
                        firstLoad: false,
                        // 是否需要反序列化
                        isDeserialize: true,
                        searchParamsKey: 'searchKey',
                        sortParamsKey: 'orderBy', // 排序参数传递key
                        sortOrderParamsKey: 'sortBy',
                        sortByRequest: true,
                        headerRequestConfig: {
                            transformResponse: [
                                (respData) => {
                                    _this.slotList = [];
                                    let resData = JSON.parse(respData);
                                    resData.data.headers.forEach((v) => {
                                        if (v.fieldType == 'FamDict' || v.attrName == _this.identifierNoAttClass) {
                                            _this.slotList.push({
                                                prop: v.attrName,
                                                type: 'default',
                                                slotName: `column:default:${v.attrName}:content`,
                                                attrName: v.attrName
                                            });
                                        }
                                        if (v.editAble) {
                                            v.editRender = {};
                                            // 所有需要编辑的属性
                                            _this.slotList.push({
                                                prop: v.attrName,
                                                type: 'edit',
                                                component: _this.getEditRenderConfig(v),
                                                slotName: `column:edit:${v.attrName}:content`,
                                                ...v
                                            });
                                        }
                                    });
                                    return resData;
                                }
                            ]
                        },
                        tableRequestConfig: {
                            data: {
                                className: _this.structuredClassName,
                                relationshipRef: _this.viewConfig.view || '',
                                addCheckoutCondition: false,
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.pdm.part.entity.EtPart#iterationInfo.latest',
                                        oper: 'EQ',
                                        value1: true,
                                        logicalOperator: 'AND',
                                        isCondition: true
                                    }
                                ],
                                isSearchCount: false,
                                tableKey: _this.structuredTableKey,
                                orderBy: 'lineNumber',
                                sortBy: 'asc',
                                deleteNoPermissionData: false
                            },
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    // 展开子节点
                                    let data = [];
                                    data = [...(resData?.data?.records || []), ..._this.displayData];
                                    resData.data.records = data;
                                    return resData;
                                }
                            ]
                        },
                        slotsField: _this.slotList,
                        toolbarConfig: {
                            valueKey: 'attrName',
                            fuzzySearch: {
                                placeholder: i18n['请输入编码或名称'],
                                show: true,
                                isLocalSearch: false, // 使用前端搜索
                                searchCondition: ['name', 'number'],
                                width: 250
                            },
                            actionConfig: {
                                // 按钮后端会有前置校验
                                name: _this.actionConfigKey,
                                className: _this.structuredClassName,
                                containerOid: _this.rootData?.containerRef?.oid,
                                extractParamMap: {
                                    // 根节点不需要加这俩个字段
                                    ...(_this.rootData?.oid == _this.info?.oid
                                        ? {}
                                        : { linkOid: _this.info?.usageRef }),
                                    tmplTemplated: false,
                                    ...(_this.rootData?.oid == _this.info?.oid
                                        ? {}
                                        : { parentOid: _this.info?.parentOid }),
                                    // 这个参数是为了替换部件存在的
                                    ...(_this.replaceClassName.includes(_this.info?.idKey)
                                        ? { className: _this.info?.idKey }
                                        : {})
                                },
                                objectOid: _this.info?.oid
                            }
                        },
                        fieldLinkConfig: {},
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
                            'edit-config': {
                                'trigger': 'click',
                                'mode': 'cell',
                                'autoClear': true,
                                'showStatus': true,
                                'keep-source': true,
                                'beforeEditMethod': ({ row, column }) => {
                                    return _this.handleBeforeEditMethod(row, column);
                                }
                            },
                            'edit-rules': this.validRules,
                            'checkbox-config': {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        tableBaseEvent: {
                            // 编辑关闭事件
                            'edit-closed': ({ row, column }) => {
                                _this.handleEditClose(row, column);
                            },
                            // 编辑校验
                            'edit-actived': ({ row, column }) => {
                                _this.handleEditActived(row, column);
                            },
                            'checkbox-change': () => {
                                _this.setBomViewButton();
                            },
                            'checkbox-all': () => {
                                _this.setBomViewButton();
                            }
                        },
                        pagination: {
                            // 分页
                            showPagination: false // 是否显示分页
                        }
                    }
                };
            },
            globalActionConfig() {
                return {
                    // 按钮后端会有前置校验
                    name: 'PART_ALTERNATE_OPERATE',
                    className: this.className
                };
            },
            localActionConfig() {
                return {
                    // 按钮后端会有前置校验
                    name: 'PART_SUBSTITUTE_OPERATE',
                    className: this.className
                };
            },
            refreshOperBtnFunction() {
                return this.$store.getters['ConstructionOperation/getRefreshOperBtnFunction'];
            },
            // 删除局部或者全局替代件时，重新请求替代部件
            refreshSubstitutePartFunction() {
                return this.$store.getters['ConstructionOperation/getSubstitutePartFunction'];
            }
        },
        mounted() {
            this.getAllView();
            // 存刷新表格方法
            this.$store.commit('ConstructionList/setRefreshConstructionTable', this.refreshTable);
            // 存表格校验的方法
            this.$store.commit('ConstructionList/setConstructionTableCheck', this.getTabletValidData);
        },
        methods: {
            getButtonData(data) {
                this.buttonList = data;
            },
            setBomViewButton() {
                const _this = this;
                let { famActionButton } = _this.$refs.ConstructionList.$refs.FamAdvancedTable.$refs.tableToolbar.$refs;
                let tableLength = this.$refs.ConstructionList.fnGetCurrentSelection();
                famActionButton.setButtonGroup([]);
                if (!_.isEmpty(tableLength)) {
                    _this.setListItemButtonStatus(famActionButton);
                } else {
                    famActionButton.setButtonGroup(_this.buttonList);
                }
            },
            setListItemButtonStatus(famActionButton) {
                // 直接置灰逻辑
                let buttonGroup = ErdcKit.deepClone(this.buttonList);
                buttonGroup
                    .find((item) => {
                        return item.name == 'PDM_PART_BOM_VIEW';
                    })
                    ?.actionLinkDtos.forEach((item) => {
                        item.actionDto.enabled = false;
                    });
                famActionButton.setButtonGroup(buttonGroup);
            },
            // 获取勾选的数据的按钮
            // getCheckDataButtonData(row) {
            //     return this.$famHttp({
            //         url: '/fam/menu/query',
            //         method: 'POST',
            //         data: {
            //             // 按钮后端会有前置校验
            //             name: this.actionConfigKey,
            //             className: this.structuredClassName,
            //             containerOid: this.rootData?.containerRef?.oid,
            //             extractParamMap: {
            //                 // 根节点不需要加这俩个字段
            //                 linkOid: row?.oid,
            //                 tmplTemplated: false,
            //                 parentOid: this.info?.oid
            //             },
            //             objectOid: row?.versionOid
            //         }
            //     });
            // },
            // 获取所有视图
            getAllView() {
                this.$famHttp({
                    url: '/fam/view/effective',
                    data: { className: 'erd.cloud.pdm.part.view.entity.View' },
                    method: 'GET'
                }).then((res) => {
                    this.allViewOptions =
                        res?.data.map((v) => {
                            return {
                                ...v,
                                label: v?.displayName,
                                value: v?.oid
                            };
                        }) || [];
                });
            },
            // 获取左边树动态父级的对象视图
            getObjectView({ masterRef, vid }) {
                let data = {
                    parentOid: masterRef,
                    branchVid: vid,
                    className: this.className
                };
                this.$store.dispatch('ObjectConstruction/getObjectView', data).then((res) => {
                    if (_.isArray(res)) res = res.slice(-1)?.[0];
                    if (res.code == 200) {
                        this.viewConfig.options = [];

                        this.viewConfig.options = res.data.map((item) => {
                            return {
                                // 视图显示名称
                                label: item?.viewDto?.displayName,
                                // bomViewOid
                                value: item?.oid,
                                // 视图内部名称
                                name: item?.viewDto?.name,
                                // 视图oid
                                viewOid: item?.viewDto?.oid,
                                isPrecise: item.isPrecise
                            };
                        });
                        // 匹配父视图
                        let isPrecise = null;
                        let isHasDefaultView = this.viewConfig.options.find(
                            (item) => item.viewOid == this.defaultView
                        )?.value;
                        if (!_.isEmpty(this.defaultView) && isHasDefaultView) {
                            this.viewConfig.view = isHasDefaultView;
                            isPrecise = this.viewConfig.options.find(
                                (item) => item.viewOid == this.defaultView
                            )?.isPrecise;
                        } else {
                            this.viewConfig.view = this.viewConfig.options && this.viewConfig.options[0]?.value;
                            isPrecise = this.viewConfig.options[0]?.isPrecise;
                        }
                        this.viewConfig.disabled = this.viewConfig.options.length < 2;
                        this.refreshTable();
                        this.$emit('setTagName', isPrecise);
                    } else {
                        this.viewConfig.options = [];
                    }
                });
            },
            // 刷新表格
            refreshTable() {
                this.$nextTick(() => {
                    this.$refs.ConstructionList.refreshTable();
                    this.editSaveData = [];
                    this.$store.commit('ConstructionList/setConstructionEditData', []);
                });
            },
            // 切换视图
            handleViewChange() {
                this.refreshTable();
                let isPrecise = null;
                isPrecise = this.viewConfig.options.find((item) => item.value == this.viewConfig.view)?.isPrecise;
                this.$emit('setTagName', isPrecise);
            },
            // 获取编辑所需渲染的控件类型
            getEditRenderConfig: function (item) {
                if (!item.editAble) {
                    return null;
                }
                return (item.fieldType && item.fieldType.replace('Erd', 'erd-')) || 'erd-input';
            },
            handleBeforeEditMethod(row) {
                // 父节点
                let parentRow = this.info;
                let rootRow = this.rootData;
                // 父节点被谁检出标识
                let lockerId =
                    parentRow['lock.locker'] && parentRow['lock.locker'].value && parentRow['lock.locker'].value.id;
                // 当前登录用户id
                let { id: userId } = this.$store.state.app.user;
                // 子节点被谁检出标识
                // let rowLockerId = row['lock.locker'] && row['lock.locker'].value && row['lock.locker'].value.id;
                if (parentRow['iterationInfo.state'] == 'CHECKED_OUT') {
                    return false;
                }
                if (parentRow['iterationInfo.state'] == 'WORKING' && lockerId && userId != lockerId) {
                    return this.$message.info(this.i18n['当前结构关系已经被别人编辑中']);
                }
                if (row.isNew) {
                    return true;
                }
                // 历史版本应不可修改
                if (!rootRow['latest']) {
                    this.$message.info(this.i18n['历史版本不可修改']);
                    return false;
                }
                if (!row['accessToView']) {
                    this.$message.info(this.i18n['安全信息不可修改']);
                    return false;
                }
                // 被他人正在编辑
                // if (row['iterationInfo.state'] == 'WORKING' && rowLockerId && userId != rowLockerId) {
                //     return this.$message.info('当前结构关系已经被别人编辑中');
                // }
                return true;
            },
            // 编辑激活时
            handleEditActived: _.debounce(function (row) {
                const _this = this;
                _this.editRow = row;
                if (row.isNew) {
                    return;
                }
                let parentRow = this.info;
                if (parentRow['iterationInfo.state'] == 'WORKING') {
                    return true;
                }
            }, 500),
            // 编辑关闭的校验规则
            checkEditClose(row, column, callback) {
                // 如果是新数据,但又没添加,就从列表中删除
                if (row.isNew && !row.identifierNo) {
                    this.$refs.ConstructionList.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.remove(row);
                    return;
                }
                callback && callback();
            },
            // 表格检验是否通过
            async getTabletValidData() {
                const $table = this.$refs.ConstructionList.$refs.FamAdvancedTable.$refs.erdTable;
                if ($table) {
                    return (await $table.validTable().catch((err) => err)) || [];
                }
            },
            // 编辑关闭时
            handleEditClose(row, column) {
                const _this = this;
                _this.checkEditClose(row, column, () => {
                    // 保存编辑后的所有数据
                    // 需求：不实时保存，要在点击保存按钮的时候才保存
                    _this.getUpdateParams(row, column);
                });
            },
            // 获取更新接口所需的参数
            getUpdateParams(row, column) {
                const _this = this;
                let tableData =
                    this.$refs.ConstructionList.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.getTableData()
                        .fullData;
                let attrList = [];
                // 获取所有编辑属性
                _this.slotList.map((v) => {
                    if (v.type == 'edit' && v.prop != _this.nameAttClass) {
                        attrList.push(v.prop);
                    }
                });
                let rowAttrData = {};
                attrList.forEach((v) => {
                    let value = _.isObject(row[v]) ? row[v]?.value : row[v];

                    // 判断value是否取成了显示名
                    let originalData = row.attrRawList.find((item) => item.attrName === v);
                    if (originalData?.displayName === value) {
                        value = originalData.value;
                    }

                    rowAttrData[v.split('#')[1]] = value;
                });
                // 一股脑push,再来去重,不然要加很多判断
                _this.editSaveData.push({
                    layoutData: rowAttrData,
                    oid: row.oid,
                    childItemRef: row.masterRef,
                    roleAObjectRef: _this.viewConfig.view || '',
                    roleBObjectRef: row.masterRef,
                    typeReference: '',
                    // 只有位号需要传这个参数
                    ...([column.property.split('#')[1]] == 'occurrences'
                        ? {
                              [column.property.split('#')[1]]: row[column.property].split(',')
                          }
                        : {})
                });
                // 去重(保留后面的)
                let hasOidMap = {};
                _this.editSaveData = _this.editSaveData.reduce((item, v) => {
                    hasOidMap[v.oid]
                        ? item.forEach((k, index) => {
                              v.oid == k.oid ? item.splice(index, 1) : '';
                          })
                        : (hasOidMap[v.oid] = true);
                    item.push(v);
                    return item;
                }, []);
                // 去除不存在的oid数据
                let oids = [];
                oids = tableData.map((v) => {
                    return v.oid;
                });
                _this.editSaveData.forEach((v, index) => {
                    if (!oids.includes(v.oid) && v) {
                        _this.editSaveData.splice(index, 1);
                    }
                });

                // 用vuex来存保存时要提交的参数
                _this.$store.commit('ConstructionList/setConstructionEditData', _this.editSaveData);
            },
            handleDisPlayData(data) {
                const _this = this;
                // let $table = this.$refs.ConstructionList.$refs.erdTable.$refs.xTable;
                Object.values(data).forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        item[key].forEach((v) => {
                            v.accessToView = false;
                            _this.displayData.push(v);
                        });
                    });
                });
                _this.refreshTable();
            }
        }
    };
});
