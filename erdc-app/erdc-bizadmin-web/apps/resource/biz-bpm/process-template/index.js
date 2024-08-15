define([
    'text!' + ELMP.resource('biz-bpm/process-template/index.html'),
    'css!' + ELMP.resource('biz-bpm/process-template/style.css'),
    'TreeUtil'
], function (template) {
    const ErdcKit = require('erdc-kit');
    const TreeUtil = require('TreeUtil');

    return {
        name: 'processTemplate',
        template: template,
        components: {
            FamResizableContainer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamResizableContainer/index.js')
            ),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            BpmProcessEditor: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/index.js')),
            CopyProcessTemplate: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-template/CopyProcessTemplate/index.js')
            ),
            ImportProcessTemplate: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-template/ImportProcessTemplate/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '创建',
                    '创建流程',
                    '更多操作',
                    '复制流程',
                    '请输入流程名称，模块',
                    '复制',
                    '导入',
                    '导出',
                    '清空',
                    '确定',
                    '创建父类型',
                    '确认删除流程类型吗',
                    '提示',
                    '取消',
                    '流程类型',
                    '流程类型名称不能为空且不能含有空格',
                    '更多',
                    '编辑',
                    '启用',
                    '禁用',
                    '撤销编辑',
                    '流程图',
                    '删除模板',
                    'BPMN',
                    '流程启用提示',
                    '流程禁用提示',
                    '流程删除提示',
                    '撤销编辑提示',
                    '你确定要撤销编辑吗？',
                    '导入流程',
                    '请勾选需要导出的数据',
                    '流程模板复制成功',
                    '流程模板复制失败',
                    '搜索关键字',
                    '请输入模板名称',
                    '不能增加',
                    '不能删除',
                    '不能编辑',
                    '请选择流程类型',
                    '流程删除成功',
                    '流程删除失败',
                    '新建成功',
                    '新建失败',
                    '更新成功',
                    '更新失败',
                    '删除成功',
                    '删除失败',
                    '撤销编辑成功',
                    '撤销编辑失败',
                    '流程禁用成功',
                    '流程禁用失败',
                    '流程启用成功',
                    '流程启用失败',
                    '确认删除',
                    '确认删除吗',
                    '流程检入成功',
                    '流程检入失败',
                    '流程检出成功',
                    '流程检出失败'
                ]),
                listData: [],
                // ErdExTree初始化完成
                isErdExTree: false,
                // 表格标题
                viewTableTitle: '',
                // 表格参数
                defaultParams: {
                    conditionDtoList: [
                        {
                            attrName: 'iterationInfo.state',
                            oper: 'IN',
                            value1: 'WORKING,CHECKED_IN,CHECKED_OUT'
                        }
                    ]
                },
                // 所属应用
                appName: '',
                // 流程分类
                categoryRef: '',
                // 设计器对象
                editorForm: {
                    visible: false,
                    templateId: null,
                    templateVId: null,
                    processDefinitionId: null,
                    category: null,
                    appName: null,
                    readonly: false,
                    loading: false
                },
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                },
                dialogObj: {
                    visible: false,
                    is: null,
                    title: '',
                    loading: false,
                    props: {},
                    handleClick: () => {
                        // do nothing
                    }
                },
                // 搜索关键字
                searchValue: '',
                // 树加载中
                treeLoading: false,
                left: { width: '240px' },
                template: null
            };
        },
        computed: {
            processDefClassName() {
                return this.$store.getters.className('processDef');
            },
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'ProcessDefViewTable', // UserViewTable productViewTable
                    viewTableTitle: this.viewTableTitle,
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        // 更多配置参考axios官网
                        defaultParams: this.defaultParams // body参数
                    },
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        },
                        actionConfig: {
                            name: 'BPM_PROCESS_DEF_CREATE',
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: this.processDefClassName
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            const { vid, oid } = ErdcKit.getObjectAttrValues(row, ['oid', 'vid']);
                            this.openProcessEditor({
                                appName: row.appName,
                                categoryRef: _.find(row.attrRawList, (attr) => /categoryRef/.test(attr.attrName))?.oid,
                                templateOId: oid,
                                templateVId: vid,
                                readonly: true
                            });
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        },
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ],
                    tableBaseEvent: {
                        scroll: _.throttle(() => {
                            let arr =
                                _.chain(this.$refs)
                                    .pick((value, key) => key.indexOf('FamActionPulldown') > -1)
                                    .values()
                                    .value() || [];
                            this.$nextTick(() => {
                                _.each(arr, (item) => {
                                    let [sitem = {}] = item?.$refs?.actionPulldowm || [];
                                    sitem.hide && sitem.hide();
                                });
                            });
                        }, 100)
                    }
                };
            },
            // 初始化树结构选中
            initCheck() {
                return this.isErdExTree && this.listData.length;
            }
        },
        watch: {
            categoryRef(newVal) {
                if (!newVal) {
                    return;
                }
                if (_.some(this.defaultParams.conditionDtoList, { attrName: 'categoryRef' })) {
                    let obj = _.find(this.defaultParams.conditionDtoList, { attrName: 'categoryRef' }) || {};
                    obj.value1 = newVal;
                } else {
                    this.defaultParams.conditionDtoList.push({
                        attrName: 'categoryRef',
                        oper: 'EQ',
                        value1: newVal
                    });
                }
                this.$refs.erdExTree && this.$refs.erdExTree.setCurrentKey(newVal);
                this.refreshTable(); // 刷新视图表格
            },
            initCheck: {
                handler: function (n) {
                    if (n) {
                        this.$nextTick(() => {
                            const firstCategory =
                                TreeUtil.getNode(this.listData, {
                                    childrenField: 'childList',
                                    target(node) {
                                        return node.oid.indexOf('Application:') === -1;
                                    }
                                }) || {};
                            this.handleNodeClick(firstCategory);
                        });
                    }
                },
                immediate: true
            },
            searchValue(val) {
                this.$refs.erdExTree.filter(val);
            }
        },
        created() {
            this.getProcessTypeList();
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item)) || [];
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        typeof value !== 'object' && (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            // 树结构搜索
            filterNode(value, data) {
                if (!value) return true;
                return data.displayName.indexOf(value) !== -1;
            },
            // 功能按钮点击事件
            actionClick(type, data) {
                const eventClick = {
                    // 创建流程
                    BPM_PROCESS_DEF_CREATE: this.createProcess,
                    // 复制流程
                    BPM_PROCESS_DEF_DUPLICATE: this.copyProcess,
                    // 导入流程
                    BPM_PROCESS_DEF_IMPORTING: this.importProcess,
                    // 导出流程
                    BPM_PROCESS_DEF_EXPORTING: this.exportProcess,
                    // 编辑流程
                    BPM_PROCESS_DEF_EDITING: this.editTemplate,
                    // 撤销编辑
                    BPM_PROCESS_DEF_UNEDIT: this.unedit,
                    // 禁用
                    BPM_PROCESS_DEF_DISABLED: this.disableProcess,
                    // 启用
                    BPM_PROCESS_DEF_INVOCATION: this.enablingProcess,
                    // 流程图
                    BPM_PROCESS_DEF_FLOW_DIAGRAM: this.viewFlowChart,
                    // 删除模板
                    BPM_PROCESS_DEF_DELETE: this.deletingProcessTemplate,
                    // BPMN
                    BPM_PROCESS_DEF_BPMN: this.downloadBPMN,
                    // 发起流程
                    BPM_PROCESS_DEF_START_PROCESS: this.initProcess,
                    // 检入流程模板
                    BPM_PROCESS_DEF_CHECK_IN: this.checkInProcessTemplate,
                    // 检出流程模板
                    BPM_PROCESS_DEF_CHECK_OUT: this.checkOutProcessTemplate
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_PROCESS_DEF_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('processDefinition')
                };
            },
            // 检出流程模板
            checkOutProcessTemplate(row) {
                this.checkOutProcessTemplateApi(row).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj['流程检出成功'] || resp?.message || '');
                        this.refreshTable();
                    }
                });
            },
            // 检出流程模板接口
            checkOutProcessTemplateApi(row) {
                let branchOId = row[`${this.processDefClassName}#vid`] || '';
                return this.$famHttp({
                    url: `/bpm/processDef/checkout`,
                    method: 'PUT',
                    params: {
                        branchOId
                    }
                });
            },
            // 检入流程模板
            checkInProcessTemplate(row) {
                let oid = row['oid'] || '';
                this.$famHttp({
                    url: `/bpm/processDef/checkIn/${oid}`,
                    method: 'POST'
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj['流程检入成功'] || resp?.message || '');
                        this.refreshTable();
                    }
                });
            },
            // 发起流程
            initProcess(row) {
                let engineModelKey = row[`${this.processDefClassName}#engineModelKey`] || '';
                let title = row[`${this.processDefClassName}#name`] || '';
                let processDefRef = row['oid'] || '';
                return this.$router.push({
                    path: `/container/bpm-resource/workflowLauncher/${engineModelKey}`,
                    query: {
                        category: this.categoryRef,
                        title,
                        processDefRef,
                        appName: row.appName
                    }
                });
            },
            // 导出流程
            exportProcess() {
                this.exportProcessTemplate();
            },
            // 导入流程
            importProcess() {
                this.popover({
                    visible: true,
                    title: this.i18nMappingObj['导入流程'],
                    is: 'ImportProcessTemplate',
                    handleClick: this.importProcessTemplate
                });
            },
            // 复制流程
            copyProcess() {
                this.popover({
                    visible: true,
                    title: this.i18nMappingObj['复制流程'],
                    is: 'CopyProcessTemplate',
                    props: {
                        category: this.categoryRef
                    },
                    handleClick: this.copyProcessTemplate
                });
            },
            // 创建流程
            createProcess() {
                this.openProcessEditor({
                    appName: this.appName,
                    categoryRef: this.categoryRef
                });
            },
            // 删除流程模板
            deletingProcessTemplate(row) {
                this.$confirm(this.i18nMappingObj['确认删除吗'], this.i18nMappingObj['确认删除'], {
                    confirmButtonText: this.i18nMappingObj['确认'],
                    cancelButtonText: this.i18nMappingObj['取消'],
                    type: 'warning'
                }).then(() => {
                    let branchOId = row[`${this.processDefClassName}#vid`] || '';
                    this.$famHttp({
                        url: `/bpm/processDef/delete?branchOId=${branchOId}`,
                        method: 'DELETE'
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj['流程删除成功'] || resp?.message);
                            this.refreshTable();
                        }
                    });
                });
            },
            // 查看流程图
            viewFlowChart(row) {
                this.bpmFlowchart.title = row['erd.cloud.bpm.process.entity.ProcessDef#name'] || '';
                this.bpmFlowchart.processDefinitionId = row[`${this.processDefClassName}#engineModelId`] || '';
                this.bpmFlowchart.visible = true;
            },
            // 打开关闭弹窗
            popover({
                visible = false,
                title = '',
                is = null,
                props = {},
                handleClick = () => {
                    /* do nothing */
                }
            }) {
                this.dialogObj.title = title;
                this.dialogObj.is = is;
                this.dialogObj.props = props;
                this.dialogObj.handleClick = handleClick;
                this.dialogObj.visible = visible;
            },
            // 下载文件
            downloadFile(url, fileName) {
                this.$famHttp({
                    url,
                    method: 'GET',
                    responseType: 'blob'
                }).then((resp) => {
                    const { data, headers } = resp || {};
                    let contentDisposition = headers['content-disposition'] || '';
                    !fileName && (fileName = contentDisposition.split('filename=')[1] || '');
                    // 此处当返回json文件时需要先对data进行JSON.stringify处理，其他类型文件不用做处理
                    //const blob = new Blob([JSON.stringify(data)], ...)
                    const blob = new Blob([data], { type: headers['content-type'] });
                    let dom = document.createElement('a');
                    let url = window.URL.createObjectURL(blob);
                    dom.href = url;
                    dom.download = decodeURI(fileName);
                    dom.style.display = 'none';
                    document.body.appendChild(dom);
                    dom.click();
                    dom.parentNode.removeChild(dom);
                    window.URL.revokeObjectURL(url);
                });
            },
            // 导出流程模板
            exportProcessTemplate() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {},
                    ids = [];
                _.isFunction(fnGetCurrentSelection) && (ids = fnGetCurrentSelection());
                if (ids.length) {
                    ids = _.map(ids, 'oid');
                    ids = ids.join(',');
                    let url = `/bpm/procmodel/export/config/${ids}`;
                    this.downloadFile(url);
                    return;
                } else {
                    this.$message.warning(this.i18nMappingObj['请勾选需要导出的数据']);
                }
            },
            onImportSuccess() {
                this.getProcessTypeList(() => {
                    this.$nextTick(() => {
                        this.$refs.erdExTree && this.$refs.erdExTree.setCurrentKey(this.categoryRef);
                        this.refreshTable();
                        this.dialogObj.visible = false;
                        this.dialogObj.loading = false;
                    });
                });
            },
            onImportError() {
                this.dialogObj.loading = false;
            },
            // 导入流程模板
            importProcessTemplate() {
                let { submitCopy } = this.$refs[this.dialogObj.is] || {};
                submitCopy(this.dialogObj);
            },
            // 编辑模板
            editTemplate(row) {
                let { value } =
                    _.find(row.attrRawList || [], {
                        attrName: `${this.processDefClassName}#iterationInfo.state`
                    }) || {};
                value === 'CHECKED_IN'
                    ? this.initializeEdit(row)
                    : this.openProcessEditor({
                          appName: row.appName,
                          categoryRef: _.find(row.attrRawList, (attr) => /categoryRef/.test(attr.attrName))?.oid,
                          templateOId: row.oid,
                          templateVId: row[`${this.processDefClassName}#vid`]
                      });
            },
            // 流程撤销编辑
            unedit(row) {
                let branchOId = row[`${this.processDefClassName}#vid`] || '';
                this.secondaryConfirmation(this.i18nMappingObj['你确定要撤销编辑吗？'], () => {
                    this.$famHttp({
                        url: `/bpm/processDef/undoCheckout?branchOId=${branchOId}`,
                        className: this.$store.getters.className('processDefinition'),
                        method: 'GET'
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18nMappingObj['撤销编辑成功'] || resp?.message);
                            this.refreshTable();
                        }
                    });
                });
            },
            // 禁用启用流程
            disableEnablingProcess(data) {
                return this.$famHttp({
                    url: `/bpm/processDef/updateStatus`,
                    method: 'POST',
                    data
                });
            },
            // 禁用流程
            disableProcess(row) {
                let { oid } = row || {};
                this.disableEnablingProcess({ oid, enableFlag: false }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj['流程禁用成功'] || resp?.message);
                        this.refreshTable();
                    }
                });
            },
            // 启用流程
            enablingProcess(row) {
                let { oid } = row || {};
                this.disableEnablingProcess({ oid, enableFlag: true }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18nMappingObj['流程启用成功'] || resp?.message);
                        this.refreshTable();
                    }
                });
            },
            // 下载bpmn
            downloadBPMN(row) {
                let oid = row[`${this.processDefClassName}#engineModelId`] || '';
                let url = `/bpm/procmodel/resource/${oid}` + '?resourceType=xml&time=' + new Date().getTime();
                this.downloadFile(url, 'bpmn.xml');
                return;
            },
            // 初始化编辑，在版本状态为check_in的状态下，点击编辑调用接口
            initializeEdit: function (row) {
                this.checkOutProcessTemplateApi(row).then((resp) => {
                    let { success, data: branchOId } = resp || {};
                    if (success) {
                        this.openProcessEditor({
                            appName: row.appName,
                            categoryRef: _.find(row.attrRawList, (attr) => /categoryRef/.test(attr.attrName))?.oid,
                            templateOId: row.oid,
                            templateVId: branchOId || row[`${this.processDefClassName}#vid`]
                        });
                    }
                });
            },
            // 二次确认框
            secondaryConfirmation(title, callback) {
                this.$confirm(title, this.i18nMappingObj['提示'], {
                    confirmButtonText: this.i18nMappingObj['确定'],
                    cancelButtonText: this.i18nMappingObj['取消'],
                    type: 'warning'
                }).then(() => {
                    _.isFunction(callback) && callback();
                });
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            },
            // 复制流程模板
            copyProcessTemplate() {
                let { submit } = this.$refs.CopyProcessTemplate || {};
                submit().then((res) => {
                    let { valid, data: form } = res || {},
                        data = new FormData();
                    if (valid) {
                        _.each(form, (value, key) => {
                            data.append(key, value);
                        });
                        this.dialogObj.loading = true;
                        this.$famHttp({
                            url: '/bpm/procmodel/copymodel',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                            data
                        })
                            .then((resp) => {
                                if (resp.success) {
                                    this.$message.success(this.i18nMappingObj['流程模板复制成功']);
                                    this.refreshTable();
                                    this.popover({ visible: false });
                                }
                            })
                            .finally(() => {
                                this.dialogObj.loading = false;
                            });
                    }
                });
            },
            // 打开流程设计器
            openProcessEditor({
                appName = '',
                categoryRef = '',
                templateOId = null,
                templateVId = null,
                processDefinitionId = null,
                readonly = false
            }) {
                if (!categoryRef) {
                    return this.$message.error(this.i18nMappingObj['请选择流程类型']);
                }
                this.editorForm.appName = appName;
                this.editorForm.categoryRef = categoryRef;
                this.editorForm.templateId = templateOId;
                this.editorForm.templateVId = templateVId;
                this.editorForm.processDefinitionId = processDefinitionId;
                this.editorForm.readonly = readonly;
                this.editorForm.visible = true;
            },
            // ErdExTree初始化完成
            initErdExTree() {
                this.isErdExTree = true;
            },
            // 获取流程类型
            getProcessTypeList(callback) {
                this.treeLoading = true;
                this.$famHttp({
                    url: '/bpm/listAllTree',
                    appName: 'ALL',
                    params: {
                        className: this.$store.getters.className('processCategory')
                    }
                })
                    .then(async (resp) => {
                        let { data = [], success } = resp || {};
                        if (success) {
                            this.initIcons(data);
                            this.listData = this.formattedProcessType(data, { parentRef: '-1' }) || [];
                            callback && callback();
                        }
                    })
                    .finally(() => {
                        this.treeLoading = false;
                    });
            },
            // 初始化流程类型
            initProcessType(item, params) {
                if (params.parentRef && params.parentRef.indexOf('Application:') > -1) {
                    params.parentRef = `OR:` + this.$store.getters.className('processCategory') + ':-1';
                }
                let {
                    id = '',
                    childList = [],
                    displayName = '',
                    oid = '',
                    isEdit = false,
                    sortOrder = 0,
                    idKey,
                    icon,
                    appName
                } = item || {};
                childList.length &&
                    (childList = this.formattedProcessType(childList, {
                        parentRef: item.oid,
                        appName: appName || params.appName
                    }));
                return {
                    id: id || '',
                    parentRef: params.parentRef || '',
                    idKey,
                    icon,
                    oid,
                    childList,
                    displayName,
                    isEdit,
                    displayNameCopy: displayName,
                    sortOrder,
                    appName: appName || params.appName || '',
                    delete: item.delete || false,
                    addSub: item.addSub || false,
                    edit: item.edit || false
                };
            },
            // 格式化流程类型
            formattedProcessType(data, params) {
                return _.map(data, (item) => this.initProcessType(item, params));
            },
            delNodeById(tree, oid = '') {
                outer: for (let i = 0; i < tree.length; i++) {
                    let item = tree[i] || {};
                    if (item.oid.toString() === oid.toString()) {
                        tree.splice(i, 1);
                        break outer;
                    }
                    if (_.isArray(item.childList) && item.childList.length) {
                        this.delNodeById(item.childList, oid);
                    }
                }
            },
            // 输入框失去焦点触发
            appendCategory({ node, data: nodeData, sortObj }) {
                if (this.submitLoading) {
                    return;
                }

                let url,
                    method = 'POST',
                    tips,
                    data = {},
                    type = 'create';
                if (!nodeData.displayName || !/^[^ ]+$/.test(nodeData.displayName)) {
                    if (nodeData.oid) {
                        nodeData.isEdit = false;
                        nodeData.displayName = nodeData.displayNameCopy;
                    } else {
                        this.delNodeById(this.listData);
                    }
                    return !nodeData.oid && !nodeData.displayName
                        ? ''
                        : this.$message.error(this.i18nMappingObj['流程类型名称不能为空且不能含有空格']);
                }
                if (!sortObj && nodeData.displayName === nodeData.displayNameCopy) {
                    nodeData.isEdit = false;
                    return;
                }
                let {
                    parent: { childNodes = [] }
                } = node || {};
                data = {
                    attrRawList: [
                        {
                            attrName: 'appName',
                            value: nodeData.appName
                        },
                        {
                            attrName: 'parentRef',
                            value: nodeData.parentRef
                        },
                        {
                            attrName: 'title',
                            value: nodeData.displayName
                        },
                        {
                            attrName: 'sortOrder',
                            value: childNodes.length === 1 ? 0 : -(childNodes.length - 1)
                        }
                    ],
                    className: this.$store.getters.className('processCategory')
                };
                if (!nodeData.oid) {
                    url = `/bpm/create`;
                    tips = this.i18nMappingObj['新建失败'];
                } else {
                    url = `/bpm/update`;
                    tips = this.i18nMappingObj['更新失败'];
                    data.oid = nodeData.oid;
                    type = 'update';
                    data.attrRawList = [
                        {
                            attrName: 'parentRef',
                            value: nodeData.parentRef
                        },
                        {
                            attrName: 'title',
                            value: nodeData.displayName
                        }
                    ];
                    if (sortObj) {
                        data.attrRawList = [
                            {
                                attrName: sortObj.key,
                                value: sortObj.value
                            }
                        ];
                    }
                }

                this.updateProcessType({
                    httpOptions: {
                        url,
                        method,
                        data
                    },
                    node: nodeData,
                    type,
                    tips
                });
            },
            // 更新流程类型
            updateProcessType({ httpOptions, node, type }) {
                if (this.treeLoading) {
                    return;
                }
                this.submitLoading = true;
                this.$famHttp(httpOptions)
                    .then((resp) => {
                        let { success } = resp || {};
                        if (!success) {
                            return;
                        }
                        const messageMap = {
                            create: this.i18nMappingObj['新建成功'],
                            update: this.i18nMappingObj['更新成功'],
                            delete: this.i18nMappingObj['删除成功']
                        };
                        if (type !== 'delete') {
                            node.isEdit = false;
                        }
                        this.$message.success(messageMap[type]);
                        return Promise.resolve();
                    })
                    .then(() => {
                        this.getProcessTypeList(() => {
                            this.$nextTick(() => {
                                this.$refs.erdExTree && this.$refs.erdExTree.setCurrentKey(this.categoryRef);
                            });
                        });
                    })
                    .catch(() => {
                        if (type === 'create') {
                            this.delNodeById(this.listData);
                        }
                        if (type === 'update') {
                            node.displayName = node.displayNameCopy;
                            node.isEdit = false;
                        }
                    })
                    .finally(() => {
                        this.submitLoading = false;
                    });
            },
            // 点击按钮
            handlerClick(node, data, type) {
                if (!data.addSub && type === 'create') {
                    return this.$message.error(this.i18nMappingObj['不能增加']);
                }
                if (!data.delete && type === 'delete') {
                    return this.$message.error(this.i18nMappingObj['不能删除']);
                }
                if (!data.edit && type === 'update') {
                    return this.$message.error(this.i18nMappingObj['不能编辑']);
                }
                switch (type) {
                    case 'create':
                    case 'update':
                        this.typeOperationFlow(node, data, type);
                        break;
                    case 'delete':
                        this.deleteQuery(data);
                        break;
                    default:
                        break;
                }
            },
            // 新建或者编辑弹出输入框
            typeOperationFlow(node, data, type) {
                node.expanded = true;
                if (type === 'create') {
                    let newNode =
                        this.initProcessType(
                            {
                                isEdit: true,
                                delete: true,
                                addSub: true,
                                edit: true
                            },
                            {
                                parentRef: data.oid || '',
                                appName: data.appName || ''
                            }
                        ) || {};
                    data.childList.unshift(newNode);
                } else {
                    data.isEdit = true;
                }
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.$refs.erdInput && this.$refs.erdInput.focus();
                    }, 0);
                });
            },
            // 删除前询问
            deleteQuery(data) {
                this.$confirm(
                    this.i18nMappingObj['确认删除流程类型吗'](data.displayName),
                    this.i18nMappingObj['提示'],
                    {
                        confirmButtonText: this.i18nMappingObj['确定'],
                        cancelButtonText: this.i18nMappingObj['取消'],
                        type: 'warning'
                    }
                ).then(() => {
                    this.updateProcessType({
                        httpOptions: { url: `/bpm/delete?oid=${data.oid}`, method: 'DELETE' },
                        node: data,
                        type: 'delete',
                        tips: this.i18nMappingObj['删除失败']
                    });
                });
            },
            // 节点被点击时的回调
            handleNodeClick(data) {
                this.viewTableTitle = data.displayName;
                this.appName = data.appName;
                this.categoryRef = data.oid.indexOf('Application') === -1 ? data.oid : '';
            },
            // 拖拽成功完成时触发的事件
            nodeDrop(draggingNode, dropNode, dropType) {
                let { data: dragData } = draggingNode || {},
                    sortObj = {};
                if (dropType === 'inner') {
                    let { data: dropData, childNodes = [] } = dropNode || {};
                    dragData.parentRef = dropData.oid;
                    dragData.appName = dropData.appName;
                    if (childNodes.length === 1) {
                        sortObj.key = 'parentOid';
                        sortObj.value = dropData.oid;
                    } else {
                        sortObj.key = 'newOid';
                        sortObj.value = childNodes[childNodes.length - 2].data.oid;
                    }
                } else {
                    let { parent, data: dropData } = dropNode || {};
                    dragData.appName = dropData.appName;
                    let { childNodes = [] } = parent || {};
                    dropData = parent.data;
                    dragData.parentRef = dropData.oid;
                    let index = 0;
                    for (let i = 0; i < childNodes.length; i++) {
                        let { data: childData } = childNodes[i] || {};
                        if (childData.oid === dragData.oid) {
                            index = i;
                            break;
                        }
                    }
                    if (!index) {
                        sortObj.key = 'parentOid';
                        sortObj.value = dropData.oid;
                    } else {
                        sortObj.key = 'newOid';
                        sortObj.value = childNodes[index - 1].data.oid;
                    }
                }
                if (dragData.parentRef && dragData.parentRef.indexOf('Application:') > -1) {
                    dragData.parentRef = `OR:` + this.$store.getters.className('processCategory') + ':-1';
                }
                if (sortObj.value && sortObj.value.indexOf('Application:') > -1) {
                    sortObj.value = `OR:` + this.$store.getters.className('processCategory') + ':-1';
                }
                this.appendCategory({ node: { parent: { childNodes: [] } }, data: dragData, sortObj });
            },
            // 判断节点能否被拖拽
            allowDrag(node) {
                let {
                    data: { edit }
                } = node || {};
                return edit;
            },
            // 判断节点拖拽后能否被放置
            allowDrop(draggingNode, dropNode, type) {
                let status = true;
                let {
                    parent = {},
                    data: { addSub: dropAddSub, appName: dropAppName }
                } = dropNode || {};
                let {
                    data: { appName: dragAppName }
                } = draggingNode || {};
                if (type === 'inner') {
                    if (!dropAddSub) {
                        status = !status;
                    }
                } else {
                    ({
                        data: { addSub: dropAddSub, appName: dropAppName }
                    } = parent || {});
                    if (!dropAddSub) {
                        status = !status;
                    }
                }
                return status && dragAppName === dropAppName;
            },
            initIcons(applications) {
                if (applications) {
                    applications.forEach((app) => {
                        app.icon && (app.icon = ErdcKit.imgUrlCreator(app.icon));
                    });
                }
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            },
            checkIfCheckinNeeded() {
                if (this.$refs.editor) {
                    this.$refs.editor.checkIfCheckinNeeded();
                }
            }
        }
    };
});
