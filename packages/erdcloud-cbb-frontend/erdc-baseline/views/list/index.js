define([
    'text!' + ELMP.func('erdc-baseline/views/list/index.html'),
    ELMP.func('erdc-baseline/operateAction.js'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.func('erdc-baseline/mixins.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js')
], function (template, operateAction, CONST, mixin, commonActions) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters, mapMutations } = createNamespacedHelpers('CbbBaseline');
    // const listScene = 'BASELINE_LIST_OPERATE';

    return {
        name: 'BaselineList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BaselineDelete: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/DeleteOperate/index.js')),
            BaselineRename: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/RenameOperate/index.js')),
            ReviseOperate: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/ReviseOperate/index.js')),
            ChangeOwner: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/ChangeOwnerOperate/index.js')),
            ChangeLifecycle: ErdcKit.asyncComponent(
                ELMP.func('erdc-baseline/components/ChangeLifecycleOperate/index.js')
            ),
            RefuseTips: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/RefuseTips/index.js')),
            BaselineMove: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/MoveOperate/index.js')),
            SaveAs: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/SaveAsOperate/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            tableKey: {
                type: String,
                default: 'BaselineView'
            },
            rowActionKey: {
                type: String,
                default: 'BASELINE_OPERATE'
            },
            extendParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            openDetail: Function,
            // 是否要提示请选择数据
            isNeedPromptInfo: {
                type: Boolean,
                default: true
            },
            changeValidatorData: Function,
            customActionMethod: Function,
            setActionConfig: Function
        },
        mixins: [mixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js')
            };
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'baseline' });
            },
            defaultBtnConfig() {
                return {
                    label: this.i18n.operate,
                    type: 'text'
                };
            },
            baselineClassName() {
                return this.viewTableMapping.className;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.baselineClassName}#persistableRef`,
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: `${this.baselineClassName}#identifierNo`,
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            slotName() {
                return {
                    identifierNo: `column:default:${this.baselineClassName}#identifierNo:content`
                };
            },
            actionConfig() {
                let { setActionConfig } = this;
                let actionConfig = {
                    name: 'BASELINE_LIST_OPERATE', //操作按钮的内部名称
                    containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                    className: this.baselineClassName, //维护到store里
                    skipValidator: true
                };
                return _.isFunction(setActionConfig) ? setActionConfig(actionConfig) : actionConfig;
            },
            vm() {
                return this;
            },
            viewTableConfig() {
                const self = this;
                let config = {
                    // 视图表格定义的内部名称
                    tableKey: self.tableKey,
                    // tableBaseEvent: {
                    //     'checkbox-all': this.selectAllEvent, // 复选框全选
                    //     'checkbox-change': this.selectChangeEvent, // 复选框勾选事件
                    //     'radio-change': this.radioChangeEvent // 单选按钮改变事件
                    // },
                    saveAs: false, // 是否显示另存为

                    tableConfig: {
                        vm: self,
                        dataKey: 'data.records',
                        tableRequestConfig: {
                            url: '/baseline/view/table/page', // 表格数据接口
                            data: {
                                containerRef: self.$store.state?.space?.context?.oid
                            },
                            ...self.extendParams
                        },
                        fieldLinkConfig: {},
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            fuzzySearch: {
                                placeholder: '请输入关键词搜索',
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: self.actionConfig
                        },
                        tableBaseConfig: {
                            'checkbox-config': {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        tableBaseEvent: {
                            scroll: _.throttle(() => {
                                let arr =
                                    _.chain(this.$refs)
                                        .pick((value, key) => key.indexOf('famActionPulldown') > -1)
                                        .values()
                                        .value() || [];
                                this.$nextTick(() => {
                                    _.each(arr, (operationComp) => {
                                        try {
                                            const [actionPulldownRef] = operationComp?.$refs?.actionPulldown || [];
                                            actionPulldownRef && actionPulldownRef.hide && actionPulldownRef.hide();
                                        } catch (e) {}
                                    });
                                });
                            }, 100)
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            }
        },
        created() {
            if (this.$route?.query.activeName) {
                delete this.$route.query.activeName;
            }
        },
        activated() {
            this.refresh();
        },
        methods: {
            ...mapMutations(['setSelectedForMerge']),
            getActionConfig(row) {
                return {
                    name: this.rowActionKey,
                    objectOid: row.oid,
                    className: this.baselineClassName
                };
            },
            getIconStyle(row) {
                const style = this.getIconClass(row.attrRawList, this.baselineClassName);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';
                return style;
            },
            getIcon(row) {
                return row[`${this.baselineClassName}#icon`];
            },
            handleCreate() {
                this.$router.push({
                    path: `${this.$route.meta.prefixRoute}/baseline/create`,
                    query: this.$route.query || {}
                });
            },
            showPersistableRef(row) {
                const fieldConfig = ErdcKit.getObjectAttr(row, `${this.baselineClassName}#persistableRef`);
                return fieldConfig && fieldConfig.displayName ? fieldConfig.displayName : '--';
            },
            handleView(row) {
                if (_.isFunction(this.openDetail)) {
                    this.openDetail(row);
                } else {
                    const isDraft = row.attrRawList.find(
                        (item) => item.attrName === `${this.baselineClassName}#lifecycleStatus.status`
                    );

                    // const path = this.cbbRoute(isDraft?.value === 'DRAFT' ? 'baselineUpdate' : 'baselineDetail', {
                    //     oid: row.oid
                    // });
                    let prefixPath = this.$route.meta.prefixRoute;
                    let editPagePath = `${prefixPath}/baseline/edit`;
                    let detailPagePath = `${prefixPath}/baseline/detail`;
                    const path = isDraft?.value === 'DRAFT' ? editPagePath : detailPagePath;

                    this.$router.push({
                        path,
                        query: Object.assign(this.$route.query || {}, {
                            oid: row.oid
                        })
                    });
                }
            },
            getIdentifierNo(row) {
                return row[`${this.baselineClassName}#identifierNo`];
            },
            handleEdit(row) {
                var self = this;
                const isDraft = row.attrRawList.find(
                    (item) => item.attrName === `${this.baselineClassName}#lifecycleStatus.status`
                );
                let route = (oid) => {
                    return {
                        // path: self.cbbRoute('baselineUpdate', {
                        //     oid
                        // }),
                        path: `${this.$route.meta.prefixRoute}/baseline/edit`,
                        query: Object.assign(this.$route.query || {}, { oid })
                    };
                };
                // 草稿不调用检出接口
                if (isDraft?.value === 'DRAFT') {
                    self.$router.push(route(row.oid));
                    return;
                }
                this.checkout(row).then((resp) => {
                    if (resp.success) {
                        self.$router.push(route(resp.data?.rawData?.oid?.value));
                    }
                });
            },
            handleBatchDelete() {
                // eslint-disable-next-line no-unused-vars
                let selections = this.$refs.fnGetCurrentSelection();
            },
            // 编辑时调用检出接口
            checkout(row) {
                let attrRawList = row.attrRawList || [];
                let iterationInfoState = attrRawList.find(
                    (i) => i.attrName === `${this.baselineClassName}#iterationInfo.state`
                );
                if (iterationInfoState && iterationInfoState.value === 'CHECKED_IN') {
                    let className = row.oid?.split(':')?.[1];
                    return this.$famHttp({
                        url: '/baseline/common/checkout',
                        className,
                        params: {
                            oid: row.oid
                        }
                    });
                } else {
                    return Promise.resolve({ success: true, data: { rawData: { oid: { value: row.oid } } } });
                }
            },
            validatorBefore(action, rows) {
                var self = this;
                let { changeValidatorData } = this;
                let multiSelect = rows.map((i) => i.oid);
                let className = multiSelect[0]?.split(':')?.[1];
                let data = {
                    moduleName: 'BASELINE_LIST_OPERATE_MENU',
                    actionName: action.name,
                    multiSelect
                };
                if (_.isFunction(changeValidatorData)) data = changeValidatorData(data);
                return this.$famHttp({
                    url: '/baseline/menu/before/validator',
                    method: 'post',
                    className,
                    data
                }).then((resp) => {
                    if (resp.success) {
                        if (!resp.data.passed) {
                            const formattedData = resp.data.messageDtoList.map((item) => {
                                const baseData = ErdcKit.deserializeArray(
                                    rows.find((rItem) => rItem.oid === item.oid).attrRawList,
                                    {
                                        valueKey: 'displayName',
                                        isI18n: true
                                    }
                                );
                                return {
                                    ...item,
                                    ...baseData
                                };
                            });
                            return self.openRefuseTipsDialog(formattedData, action).then((forceContinue) => {
                                if (forceContinue) {
                                    const items = rows.filter(
                                        (item) => formattedData.findIndex((fItem) => fItem.oid === item.oid) < 0
                                    );
                                    //信息比较如果只有一条非草稿数据不比较,两条以上才比较
                                    if (action.name == 'BASELINE_COMPARE') {
                                        return {
                                            flag: items.length > 1,
                                            items
                                        };
                                    }
                                    return {
                                        flag: items.length > 0,
                                        items
                                    };
                                }
                                return {
                                    flag: false
                                };
                            });
                        }
                        return {
                            flag: true,
                            items: rows
                        };
                    }
                });
            },
            fnCallback() {},
            handleMerge(rows) {
                rows = rows || [];
                let OIds = rows.map((i) => i.oid);
                this.setSelectedForMerge(OIds);
                this.$router.push({
                    path: `${this.$route.meta.prefixRoute}/baseline/merge`,
                    query: this.$route.query || {}
                });
            },
            openRefuseTipsDialog(row, action) {
                return this.$refs.refuseTipsDialog.open(row, action.displayName);
            },
            openDeleteDialog(row) {
                const data = Array.isArray(row) ? row : [row];
                if (data.length === 0) {
                    return this.$message.error(this.i18n.selectTip);
                }
                this.$refs.deleteDialog.open(data);
            },
            openRenameDialog(row) {
                this.$refs.renameDialog.open(row);
            },
            openReviseDialog(row) {
                this.$refs.reviseDialog.open(row);
            },
            openChangeOwnerDialog(row) {
                this.$refs.changeOwnerDialog.open(row);
            },
            openChangeLifecycleDialog(row) {
                this.$refs.changeLifecycleDialog.open(row);
            },
            openMoveDialog(row) {
                this.$refs.moveDialog.open(row);
            },
            openSaveAsDialog(row) {
                const data = Array.isArray(row) ? row : [row];
                if (data.length === 0) {
                    return this.$message.error(this.i18n.selectTip);
                }
                this.$refs.saveAsDialog.open(data);
            },
            handleUnCheckOut(row) {
                var self = this;
                let className = row.oid?.split(':')?.[1];
                this.$famHttp({
                    url: '/baseline/common/undo/checkout',
                    method: 'get',
                    className,
                    params: {
                        oid: row.oid
                    }
                }).then(() => {
                    self.$message.success('成功');
                    self.reloadTable();
                });
            },
            handleCheckIn(row) {
                var self = this;
                const props = {
                    visible: true,
                    type: 'save',
                    disabled: true,
                    className: CONST.className,
                    title: self.i18n.save,
                    rowList: Array.isArray(row) ? row : [row],
                    urlConfig: {
                        save: '/baseline/common/checkin',
                        source: '/baseline/content/attachment/replace'
                    }
                };
                operateAction.mountDialogSave(props, () => {
                    self.reloadTable();
                });
            },
            reloadTable() {
                this.$refs.famViewTable?.getTableInstance('advancedTable', 'refreshTable')('default');
            },
            /**
             * 刷新Api，暴露给公共的操作行为调用。
             */
            refresh() {
                this.reloadTable();
            },
            getIconClass(attrData, className) {
                var result = {};

                const iterationInfoStateProp = className ? `${className}#iterationInfo.state` : 'iterationInfo.state';
                const lifecycleStatusProp = className
                    ? `${className}#lifecycleStatus.status`
                    : 'lifecycleStatus.status';
                const stateProp = className ? `${className}#lifecycleStatus.status` : 'state';
                const generalStatusProp = className ? `${className}#generalStatus` : 'generalStatus';

                let iconData = attrData;
                if (Array.isArray(attrData)) {
                    iconData = {};
                    attrData.forEach((item) => {
                        if (
                            item.attrName === iterationInfoStateProp ||
                            item.attrName === lifecycleStatusProp ||
                            item.attrName === generalStatusProp ||
                            item.attrName === stateProp
                        ) {
                            iconData[item.attrName] = item.value;
                        }
                    });
                }

                // 检出状态
                if (iconData[iterationInfoStateProp] == 'WORKING' || iconData[stateProp] == 'WORKING') {
                    result = {
                        color: '#FCB11E'
                    };
                }
                // 已检出
                else if (iconData[iterationInfoStateProp] == 'CHECKED_OUT' || iconData[stateProp] == 'CHECKED_OUT') {
                    // 原始版本
                    result = {
                        color: 'orange'
                    };
                }
                // 检入状态
                else if (iconData[iterationInfoStateProp] == 'CHECKED_IN' || iconData[stateProp] == 'CHECKED_IN') {
                    result = {
                        color: '#246DE6'
                    };
                }
                // 草稿状态
                if (
                    iconData[lifecycleStatusProp] === 'DRAFT' ||
                    iconData[generalStatusProp] == 'uploadOnly' ||
                    iconData[stateProp] == 'DRAFT'
                ) {
                    result = {
                        color: '#8B572A'
                    };
                }
                return result;
            },
            //比较相关信息
            handleInfoCompare(row) {
                const data = {
                    props: ErdcKit.deepClone(this.viewTableMapping) || {},
                    routePath: `${this.$route?.meta?.prefixRoute}/baseline/infoCompare`
                };
                commonActions.handleInfoCompare(this, row, data);
            }
        }
    };
});
