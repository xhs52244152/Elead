/**
 * @description 结构组件
 */
define([
    'text!' + ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstruction/index.html'),
    ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstruction/minxins/index.js'),
    ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstruction/store.js'),
    ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstruction/actions.js'),
    'css!' + ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstruction/index.css')
], function (template, operMinxin, store, actions) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('PdmConstruction', store);
    ErdcStore.dispatch('registerActionMethods', actions);
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('PdmObjectConstruction');

    return {
        name: 'PdmConstruction',
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
            info: [Object]
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            // 穿梭框组件
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            // 输入框搜索对象组件
            InputSearchObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InputSearchObject/index.js'))
        },
        data() {
            const lineNumberValid = (rule, cellValue) => {
                // 模拟服务端校验
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (_.isNaN(Number(cellValue))) {
                            reject(new Error('行号数据类型错误'));
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
                        var reg = /^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/g;
                        if (!reg.test(cellValue)) {
                            reject(new Error('位号格式错误'));
                        } else {
                            resolve();
                        }
                    }, 100);
                });
            };

            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
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
                    'erd.cloud.pdm.part.entity.EtPartUsageLink#occurrences': [{ validator: occurrencesValid }]
                }
            };
        },
        watch: {
            oid(newVal) {
                if (newVal) {
                    this.refreshTable();
                }
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
            mainContentField() {
                return `${this.className}#mainContent`;
            },
            tableKey() {
                return this.getStructuredMapping({ mappingName: 'tableViewKeyMap', className: this.className });
            },
            module() {
                return this.getStructuredMapping({ mappingName: 'moduleMap', className: this.className });
            },
            nameEditSlot() {
                return 'column:edit:' + this.nameAttClass + ':content';
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
                                    _this.slotList = [
                                        {
                                            prop: _this.mainContentField,
                                            attrName: _this.mainContentField,
                                            type: 'default',
                                            slotName: `column:default:${_this.mainContentField}:content`
                                        }
                                    ];
                                    let resData = JSON.parse(respData);
                                    resData.data.headers.forEach((v) => {
                                        // 数据字典属性的控件，显示时候要单独处理FamDict
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
                            // 更多配置参考axios官网
                            // url: `/fam/view/table/page`, // 表格数据接口
                            data: {
                                className: _this.structuredClassName,
                                relationshipRef: _this.oid,
                                isSearchCount: false,
                                tableKey: _this.structuredTableKey,
                                // orderBy: 'lineNumber',
                                sortBy: 'asc',
                                deleteNoPermissionData: false
                            },
                            // method: 'POST', // 请求方法
                            transformResponse: [
                                (respData) => {
                                    let resData = JSON.parse(respData);
                                    // 展开子节点
                                    let data = [];
                                    data = [...(resData?.data?.records || []), ..._this.displayData];
                                    data;
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
                                        : { linkOid: _this.info?.usageLinkOid }),
                                    tmplTemplated: false,
                                    ...(_this.rootData?.oid == _this.info?.oid
                                        ? {}
                                        : { parentOid: _this.info?.parentOid })
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
                            'edit-actived': ({ row, column }) => {
                                _this.handleEditActived(row, column);
                            }
                        },
                        pagination: {
                            // 分页
                            showPagination: false // 是否显示分页
                        }
                    }
                };
            },
            requestParams() {
                return {
                    url: '/fam/substitute/getByUsageLinkId',
                    params: {
                        usageLinkId: this.info?.usageLinkOid
                    }
                };
            }
        },
        mounted() {
            // setTimeout(() => {
            //     document.querySelector('.advanced-table-container').style.padding = '0';
            //     document.querySelector('#pane-substructure').style.marginRight = '-16px';
            // }, 1000);
            // 获取视图
            this.$store.commit('PdmConstruction/setRefreshConstructionTable', this.refreshTable);
        },
        methods: {
            // 刷新表格
            refreshTable() {
                this.$nextTick(() => {
                    this.$refs.PdmConstruction.refreshTable();
                    this.editSaveData = [];
                    this.$store.commit('PdmConstruction/setConstructionEditData', []);
                });
            },
            // 获取编辑所需渲染的控件类型
            getEditRenderConfig: function (item) {
                if (!item.editAble) {
                    return null;
                }
                return (item.fieldType && item.fieldType.replace('Erd', 'erd-')) || 'erd-input';
            },
            handleBeforeEditMethod(row) {
                let { i18n } = this;
                // 父节点
                let parentRow = this.info;
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
                    return this.$message.info(i18n['当前结构关系已经被别人编辑中']);
                }
                if (row.isNew) {
                    return true;
                }
                if (!row.accessToView) {
                    return false;
                }
                // 检出状态
                // if (row['iterationInfo.state'] == 'CHECKED_OUT') {
                //     return false;
                // }
                // // 被他人正在编辑
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
                    // 如果不是当前登录人
                    // if (parentRow['lock.locker'] && $.el.auth.user.id != parentRow['lock.locker']) {
                    //     $.msg.tips($.i18n.get('structural_editing'));
                    //     return false;
                    // }

                    return true;
                }
                _this.hanldeCheckout(this.oid);
            }, 500),
            // 编辑关闭的校验规则
            checkEditClose(row, column, callback) {
                // 如果是新数据,但又没添加,就从列表中删除
                if (row.isNew && !row.identifierNo) {
                    this.$refs.PdmConstruction.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.remove(row);
                    return;
                }
                for (const key in row) {
                    if (Object.hasOwnProperty.call(row, key)) {
                        if (key.split('#')[key.split('#').length - 1] == 'occurrences' && row[key]) {
                            var occurrences = [];
                            var reg = /^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/g;
                            if (reg.test(row[key])) {
                                occurrences = row[key];
                            } else {
                                this.$message.warning(this.i18n['位号格式错误']);
                                return null;
                            }
                            row[key] = occurrences;
                        }
                    }
                }
                callback && callback();
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
                    this.$refs.PdmConstruction.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.getTableData()
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
                _this.$store.commit('PdmConstruction/setConstructionEditData', _this.editSaveData);
            },
            handleDisPlayData(data) {
                const _this = this;
                // let $table = this.$refs.PdmConstruction.$refs.erdTable.$refs.xTable;
                Object.values(data).forEach((item) => {
                    Object.keys(item).forEach((key) => {
                        item[key].forEach((v) => {
                            v.accessToView = false;
                            _this.displayData.push(v);
                        });
                    });
                });
                _this.refreshTable();
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
            // 主内容点击
            download(row) {
                let { className, getMainContent } = this;

                getMainContent(row.versionOid).then((mainContent) => {
                    if (!mainContent) return;
                    //url链接
                    if (mainContent.source === 1) {
                        window.open(mainContent.value);
                    } else {
                        ErdcKit.downFile({
                            url: 'fam/content/file/download',
                            className,
                            method: 'GET',
                            data: {
                                id: mainContent.id
                            }
                        });
                    }
                });
            }
        }
    };
});
