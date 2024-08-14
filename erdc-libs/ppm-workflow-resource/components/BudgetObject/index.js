define([
    'text!' + ELMP.resource('ppm-workflow-resource/components/BudgetObject/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('project-budget/index.js')
], function (template, ErdcKit, ppmStore, ppmUtils, templateInit) {
    // 在工作台->预算流程下，会调用menu-actions.js里面注册的方法，因此需要在这里再次注册
    templateInit.init();
    return {
        template,
        components: {
            ProjectBudget: ErdcKit.asyncComponent(ELMP.resource('project-budget/views/list/index.js')),
            CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')),
            ChooseSubjectTree: ErdcKit.asyncComponent(
                ELMP.resource('ppm-workflow-resource/components/BudgetObject/components/ChooseSubjectTree/index.js')
            ),
            CommonCard: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Card/index.js'))
        },
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            customFormData: Object,
            processInfos: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                className: ppmStore.state.classNameMapping.project,
                panelUnfolds: true,
                // 记录加载预算列表数据的搜索条件与状态
                loadListOp: {
                    searchValue: null // 搜索条件
                },
                startOp: {
                    autoRe: false,
                    resolve: null,
                    isDraft: null
                },
                isFullscreen: false,
                addBudgetDialogVisible: false
            };
        },
        computed: {
            // 业务对象是否可编辑（驳回重填节点可编辑）
            readonly() {
                return !!(this.processInfos?.nodeMap && !this.isResubmitNode);
            },
            // 是否驳回重填节点
            isResubmitNode() {
                return this.curSessionId === 'reject';
            },
            // 当前流程节点id
            curSessionId() {
                return this.processInfos?.nodeMap?.node?.highLightedActivities?.[0];
            },
            businessProjectOid() {
                return this.businessData[0]?.projectOid;
            },
            conditionData() {
                // 流程处于“已结束”等状态时（取消流程也会是“已结束”状态），预算列表数据需要使用条件查询对应快照数据（流程当时的数据）
                if (['LIFECYCLE_COMPLETED'].includes(this.processInfos?.processStatusEnum)) {
                    return {
                        processInstanceOid: this.processInfos.oid
                    };
                }
                return null;
            },
            // 限制显示的预算根科目link的code编码集合
            rootLinkCodes() {
                return this.businessData[0]?.rootLinkCodes || [];
            },
            // 驳回时（一般驳回到重新提交节点）的科目linkOid数据
            oldAllLinkOids() {
                return this.businessData[0]?.oldAllLinkOids || [];
            },
            // 预算关联科目对象
            budgetLinkClassName() {
                return ppmStore?.state?.classNameMapping?.budgetLink;
            },
            formSlots() {
                return {
                    'identifier-no': ErdcKit.asyncComponent(
                        ELMP.resource('ppm-workflow-resource/components/commonIdentifierNo/index.js')
                    ),
                    'budget-form': ErdcKit.asyncComponent(
                        ELMP.resource('ppm-workflow-resource/components/BudgetObject/components/BudgetForm/index.js')
                    )
                };
            }
        },
        methods: {
            onLoadListBefore({ data, searchParamsKey }) {
                this.loadListOp.searchValue = data[searchParamsKey];
            },
            onLoadedData(tableData) {
                // 如果是需要自动启动
                if (this.startOp.autoRe) {
                    this.startSubmit(this.startOp.resolve, this.startOp.isDraft, tableData);
                    this.startOp = {
                        autoRe: false,
                        resolve: null,
                        isDraft: null
                    };
                }
            },
            validate(type) {
                let budgetFormRef = this.$refs.form.$refs['budget-form'][0];
                let initFormRef = budgetFormRef.$refs.budgetForm.$refs.initForm;
                let validate = initFormRef.$refs.dynamicForm.validate;
                return new Promise((resolve, reject) => {
                    // 如果是只读状态就直接返回businessData
                    if (this.readonly) {
                        return resolve(this.businessData);
                    }
                    this.businessData[0].budgetData = budgetFormRef.getData();
                    // 如果是保存草稿就不校验预算布局字段是否必填
                    if (type === 'draft') {
                        return this.resolveData(resolve, true);
                    }
                    validate().then((res) => {
                        if (res) this.resolveData(resolve);
                        else reject('error');
                    });
                });
            },
            async resolveData(resolve, isDraft) {
                // 如果表单是有搜索条件的，则清空搜索条件查询然后再走流程提交
                if (this.loadListOp.searchValue) {
                    this.startOp.autoRe = true;
                    this.startOp.resolve = resolve;
                    this.startOp.isDraft = isDraft;
                    this.$refs['budgetTableRef'].refresh({ conditions: 'clear', searchStr: '' }); // 清空查询条件&&刷新，会触发onLoadListBefore与onLoadedData
                    return; // 注：这里不能reject
                }
                this.startSubmit(resolve, isDraft);
            },
            async startSubmit(resolve, isDraft, tableData) {
                tableData = tableData || this.$refs['budgetTableRef'].getTableData() || [];
                // 重新获取表单对应的字段数据（可能有新增or删除，因此提交时要重新获取）
                let rootLinkOids = tableData.map((r) => r.rootLinkOid);
                // 草稿时，不需要做校验与多余赋值
                if (isDraft) {
                    this.setRootLinkCodes(tableData, rootLinkOids);
                    return resolve(this.businessData);
                }
                if (rootLinkOids?.length) {
                    // 根据根节点获取该根节点与所有子节点的linkOid集合
                    let allLinkOids = await this.getAllLinkOids(rootLinkOids);
                    if (allLinkOids?.valid === false) {
                        return resolve(allLinkOids); // 抛出错误信息
                    }
                    // 去重赋值
                    this.businessData[0].allLinkOids = _.uniq(allLinkOids);
                    // 过滤出已经不存在的根节点数据（会存在被同步删除的情况）
                    rootLinkOids = rootLinkOids.filter((linkOid) => allLinkOids.includes(linkOid));
                }
                // 判断如果没有选择根节点
                if (!rootLinkOids?.length) {
                    let message = '';
                    // 根节点数据虽然还显示在表格，但可能被同步删除了
                    if (tableData.length > 0 && tableData.length !== rootLinkOids.length) {
                        message = this.$t('budgetInfoDelNotEmpty'); // 您选择的预算数据可能已全部被删除，请确认！
                    } else {
                        message = this.$t('budgetInfoNotEmpty'); // 预算信息不能为空！
                    }
                    return resolve({ message: message, valid: false });
                } else {
                    this.setRootLinkCodes(tableData, rootLinkOids);
                    resolve(this.businessData);
                }
            },
            setRootLinkCodes(tableData, rootLinkOids) {
                // 最终提交前 重新获取表单对应的字段数据（可能有新增or删除，因此提交时要重新获取）
                this.businessData[0].rootLinkCodes = (tableData || [])
                    .filter((r) => rootLinkOids.includes(r.rootLinkOid))
                    .map((r) => r.rootLinkCode);
            },
            // 判断并做卡片最大化/最小化
            toggleFullscreen(isShow) {
                this.$refs.card.handleFullscreen(isShow);
            },
            // 卡片最大化/最小化的回调事件
            fullscreenAfter(isFull) {
                this.isFullscreen = isFull;
            },
            changeTableConfig(config) {
                // config.toolbarConfig && (config.toolbarConfig.showRefresh = false); // 隐藏刷新按钮
                return config;
            },
            // 根据根节点获取所有子节点的linkOid集合
            async getAllLinkOids(rootLinkOids) {
                return new Promise((resolve) => {
                    // 1、该接口会把已经被删除的根节点linkOid排除掉；2、所有校验成功后返回对应根节点与所有子节点的linkOid
                    this.$famHttp({
                        url: '/ppm/budget/link/tree',
                        method: 'POST',
                        params: {
                            inProcess: true, // 该标识为true时，后端会判断所有根节点是否有在途流程，如果有会给出提示
                            processInstanceOid: this.processInfos.oid // inProcess=true时有效（判断是否有在途流程时，排除当前流程）
                        },
                        data: rootLinkOids,
                        appName: 'PPM'
                    })
                        .then((res) => {
                            resolve(res?.data || []);
                        })
                        .catch((e) => {
                            // 目前页面会同时提示两次，流程前端平台提示一次，接口false与message也会提示一次
                            resolve({ message: e.message, valid: false });
                        });
                });
            },
            // 增加根节点之后的回调
            addRootNodeAfter(rawDataVoList) {
                let newRootLinkCodes = this.businessData[0]?.rootLinkCodes || [];
                rawDataVoList.forEach((raw) => {
                    // 不做空判断，报错后容易定位问题
                    newRootLinkCodes.push(raw.attrRawList.find((r) => r.attrName === 'code')['value']);
                });
                this.businessData[0].rootLinkCodes = newRootLinkCodes;
                this.syncCustomFormJson(); // 同步保存到流程数据库
                // addRootNodeAfter事件源会刷新预算列表，因此此处不需要单独调用刷新
            },
            handleAdd() {
                this.addBudgetDialogVisible = true;
            },
            // 添加科目树弹窗 自定义数据过滤的方法
            customFilterTableDataFn(tableData = []) {
                tableData = tableData?.filter((r) => {
                    // 待提交状态 || 当前流程中的审批中状态
                    if (
                        ['PENDING_SUBMIT'].includes(r[`${this.budgetLinkClassName}#budgetLinkStatus_value`]) ||
                        this.oldAllLinkOids.includes(r[`rootLinkOid`])
                    ) {
                        return true;
                    }
                    return false;
                });
                return tableData;
            },
            // 添加科目树弹窗 确认后的回调事件
            addSubjectConfirm({ selectedRootLinkCodes, cancel }) {
                // 合并去重
                this.businessData[0].rootLinkCodes = _.uniq(
                    this.businessData[0].rootLinkCodes.concat(selectedRootLinkCodes || [])
                );
                cancel(); // 关闭弹窗
                this.$refs['budgetTableRef'].refresh({ conditions: 'clear', searchStr: '' }); // 清空查询条件&&刷新预算列表

                // 同步保存到流程数据库
                this.syncCustomFormJson(() => {
                    cancel(); // 关闭弹窗
                    this.$refs['budgetTableRef'].refresh({ conditions: 'clear', searchStr: '' }); // 清空查询条件&&刷新预算列表
                });
            },
            handleRemove() {
                // 获取选中的数据
                let selectedData = this.$refs['budgetTableRef'].getSelectedData(true);
                if (selectedData === false) {
                    return;
                }
                // 获取选中数据的根节点link的code编码集合
                let selectedRootLinkCodes = _.uniq(selectedData.map((r) => r['rootLinkCode']));

                // 过滤得到新的rootLinkCodes
                this.businessData[0].rootLinkCodes = (this.businessData[0].rootLinkCodes || []).filter(
                    (rootLinkCode) => !selectedRootLinkCodes.includes(rootLinkCode)
                );
                // 同步保存到流程数据库
                this.syncCustomFormJson(() => {
                    this.$refs['budgetTableRef'].refresh({ conditions: 'clear', searchStr: '' }); // 清空查询条件&&刷新预算列表
                    this.$message.success(this.$t('removalSuccess')); // 移除成功
                });
            },
            // 同步保存到流程数据库
            syncCustomFormJson(successFn) {
                // 修改流程customformJson数据
                return ppmUtils
                    .syncCustomFormJson({
                        businessData: this.businessData,
                        processInfos: this.processInfos,
                        customFormData: this.customFormData
                    })
                    .then((res) => {
                        if (typeof successFn === 'function') {
                            successFn(res);
                        }
                    });
            }
        }
    };
});
