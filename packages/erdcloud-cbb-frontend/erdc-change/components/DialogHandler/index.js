define([
    'text!' + ELMP.func('erdc-change/components/DialogHandler/index.html'),
    ELMP.func('erdc-change/api.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    'css!' + ELMP.func('erdc-change/components/DialogHandler/style.css')
], function (template, api, viewCfg) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ChangeDialogHandler',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            DialogBatch: ErdcKit.asyncComponent(ELMP.func('erdc-change/components/DialogBatch/index.js')),
            DialogCollectObjects: ErdcKit.asyncComponent(
                ELMP.func('erdc-change/components/DialogCollectObjects/index.js')
            ),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            visible: Boolean,
            joinClassName: Boolean,
            title: String,
            className: String,
            type: String,
            width: {
                type: String,
                default: '1200px'
            },
            rowList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            /**
             * 列配置对象包含两部分。除了vxe-table的配置属性外，还包含
             * {
             *     originProp: String   // 获取当前列属性数据时，取originProp属性值
             *     joinClassName: String // 连接className
             * }
             */
            columns: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            urlConfig: {
                type: Object,
                default: function () {
                    return {
                        rename: '/fam/common/rename',
                        saveAs: '/change/saveAs',
                        ownerBy: '/fam/common/batchUpdateOwnerBy',
                        move: '/fam/folder/batchMoveObject',
                        setState: '/change/common/batchResetState'
                    };
                }
            },
            isCollectObject: {
                type: Boolean,
                default: true
            },
            // 参与者选择
            queryParams: {
                type: Object,
                default: () => {
                    return {
                        data: {
                            appName: 'PDM',
                            isGetVirtualRole: true
                        }
                    }
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                loading: false,
                batchDialogVisible: false,
                folderTreeList: [], // 文件夹
                contextList: [], // 上下文
                treeProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                },
                searchValue: '',
                tableData: [],
                viewData: [],
                stateList: [],
                selectedData: [], // 选中的数据
                moveData: {},
                newContainerRef: '',
                contextObj: {},
                folderObj: {},
                collectProps: {},
                batchTitle: '',
                folderExpandKeys: [],
                // 参与者范围
                queryScope: 'fullTenant'
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            // 上下文配置
            rowContext() {
                return {
                    componentName: 'virtual-select', // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                    requestConfig: {
                        // 请求接口的配置对象
                        url: api.listByKey,
                        params: {
                            className: viewCfg.otherClassNameMap.pdmProduct
                        },
                        viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                        valueProperty: 'containerRef' // 显示value的key（如果里面也配置，取里面的）
                        // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                    },
                    clearNoData: true // value未匹配到option中数据时，清除数据项
                };
            },

            // 设置状态
            rowState() {
                return {
                    componentName: 'constant-select',
                    clearNoData: true,
                    viewProperty: 'displayName',
                    valueProperty: 'value',
                    referenceList: this.stateList
                };
            },
            editConfig() {
                // return { trigger: 'click', mode: 'cell' };
                let editConfig = this.isBatchOperations ? {} : { trigger: 'click', mode: 'cell' };
                //设置状态，批量/单条都可以修改
                if (['setState', 'rename', 'owner'].includes(this.type)) {
                    editConfig = { trigger: 'click', mode: 'cell' };
                }
                return editConfig;
            },
            isBatchOperations() {
                const arr = ['move', 'setState', 'rename', 'owner'];
                const isFlag = this.tableData.length > 1 && arr.includes(this.type);
                return isFlag;
            }
        },
        watch: {
            viewData: {
                handler: function (val) {
                    val.forEach((item) => {
                        let index = this.tableData.findIndex((j) => item.oid === j.oid);
                        if (index > -1) {
                            this.tableData[index] = item;
                        }
                    });
                },
                deep: true,
                immediate: true
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            onFolderOptionsChange(options = []) {
                // 选项更新后，设置默认展开选项
                this.folderExpandKeys = options.length > 0 ? [options[0].oid] : [];
            },
            // 文件夹配置
            getFolderRow(row) {
                return {
                    componentName: 'virtual-select', // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                    requestConfig: {
                        // 请求接口的配置对象
                        url: '/fam/listAllTree',
                        params: {
                            className: viewCfg.otherClassNameMap.subFolder,
                            containerRef: row.afterContext || row.containerRef
                        },
                        viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                        valueProperty: 'oid' // 显示value的key（如果里面也配置，取里面的）
                        // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                    },
                    clearNoData: true // value未匹配到option中数据时，清除数据项
                };
            },
            init() {
                const { rowList, columns, className } = this;

                this.tableData = rowList.map((item) => {
                    let rowData = {};

                    if (columns.length) {
                        columns.forEach((column) => {
                            let prop = column.originProp || column.prop;
                            prop = column.joinClassName ? `${className}#${prop}` : prop;

                            rowData[column.prop] = item[prop] ?? '';
                            rowData = { rowData, ...item };
                        });
                    } else {
                        let containerData = {};
                        //列表有attrRawList,详情没有attrRawList,返回的是所有属性
                        if (item?.attrRawList?.length > 0) {
                            containerData = item?.attrRawList?.find((item) => item.attrName === 'containerRef');
                        } else {
                            containerData = item['containerRef'];
                        }
                        item['containerName'] = containerData?.displayName || '';
                        item['containerRef'] = containerData?.oid || '';
                        rowData = { ...item };
                    }

                    /**
                     * TODO: 传入DialogHandler数据格式应该是统一的，所以关于数据的处理应该放到调用外。
                     * 目前暂时放到
                     */

                    if (_.isObject(rowData?.containerRef) && Object.keys(rowData?.containerRef).length) {
                        const { displayName, oid } = rowData?.containerRef || {};
                        rowData['containerName'] = displayName;
                        rowData['containerRef'] = this.type === 'rename' ? displayName : oid;
                    } else {
                        rowData[`${this.className}#containerName`] = rowData[`${this.className}#containerRef`] || '';
                    }

                    if (_.isObject(rowData?.ownedByRef) && Object.keys(rowData.ownedByRef).length) {
                        rowData['ownedByRef'] = rowData?.ownedByRef?.displayName;
                    }

                    if (this.type === 'saveAs') {
                        const key = this.joinClassName ? `${this.className}#rename` : 'rename';
                        this.$set(rowData, key, item[key]);
                        this.$set(rowData, 'showContext', '');
                        this.$set(rowData, 'showFolder', '');
                    }

                    rowData.oid = item.oid;
                    return rowData;
                });

                this.viewData = ErdcKit.deepClone(this.tableData);

                if (this.type === 'setState') this.getStateData();
            },
            editActived({ column }) {
                if (column.property === 'state') {
                    this.$nextTick(() => {
                        this.$refs.customSelectRef?.focus();
                    });
                } else if (column.property === 'rename') {
                    this.$nextTick(() => {
                        this.$refs.renameRef?.focus();
                    });
                } else if (column.property === 'owner') {
                    this.$nextTick(() => {
                        this.$refs.ownerRef?.$refs?.selectBox?.click();
                    });
                }
            },
            getStateData() {
                const oIds = this.tableData.map((item) => item.oid);
                this.$famHttp({
                    url: '/document/common/template/states',
                    data: {
                        branchIdList: oIds,
                        className: this.className,
                        successionType: 'SET_STATE'
                    },
                    method: 'POST'
                }).then((res) => {
                    // 将返回的状态一一对应到批量操作数组
                    const stateList = Object.values(res.data);
                    this.stateList = stateList?.[0]?.map((item) => ({
                        ...item,
                        value: item.name,
                        i18nValue: item.displayName,
                        isExtends: false
                    }));
                });
            },
            onChange() {},
            changeState(value, data, row) {
                const res = this?.stateList?.find((item) => item.value == value) || {};
                if (row) {
                    this.$set(row, 'stateName', res.displayName);
                }
            },
            //处理-选中需要批量修改属性的数据
            handleEchoData(item, attr) {
                let { selectedData } = this;
                let selectedOidArr = selectedData.map((item) => item.oid);
                return selectedOidArr.includes(item.oid) ? ErdcKit.deepClone(attr) : '';
            },
            // 移动emit
            batchSubmit(data, echoData) {
                if (this.type == 'setState') {
                    //赋值对象到数组，要深拷贝一个对象
                    this.tableData.forEach((item) => {
                        item.state = this.handleEchoData(item, data.state) || item.state;
                        item.stateName = this.handleEchoData(item, data.stateName) || item.stateName;
                    });
                } else if (this.type == 'rename') {
                    this.tableData.forEach((item) => {
                        item.rename = this.handleEchoData(item, data.rename) || item.rename;
                    });
                } else if (this.type == 'owner') {
                    this.tableData.forEach((item) => {
                        item.owner = this.handleEchoData(item, data?.owner?.oid) || item.owner;
                        item.ownerName = this.handleEchoData(item, data.owner?.displayName) || item.ownerName;
                        item.ownerObj = ErdcKit.deepClone([data.owner]) || item.ownerObj;
                    });
                } else {
                    this.moveData = data;
                    this.tableData.forEach((item) => {
                        item.afterContext = this.handleEchoData(item, echoData.contextId) || item.afterContext;
                        item.showContext = this.handleEchoData(item, echoData.contextName) || item.showContext;
                        item.afterFolder = this.handleEchoData(item, echoData.folderId) || item.afterFolder;
                        item.showFolder = this.handleEchoData(item, echoData.folderName) || item.showFolder;
                    });
                }
                this?.$refs['erdTable']?.$refs['xTable']?.clearCheckboxRow();
                //清空已经选中的数据
                this.selectedData = [];
            },
            onSubmit() {
                this.submit(this.type);
            },
            submit(type) {
                const handlerMap = {
                    rename: this.handleRename,
                    owner: this.handleChangeOwner,
                    saveAs: this.handleSaveAs,
                    move: this.handleMove,
                    setState: this.handleSetState
                };
                this.loading = true;

                const handler = handlerMap[type];
                if (handler) {
                    handler
                        .call(this)
                        .then(() => {
                            this.$message.success('操作成功');
                            this.$emit('success');
                            this.$emit('onsubmit', false);
                            this.toggleShow();
                        })
                        .catch((err) => {
                            //保存为空时的提示
                            if (!err?.data?.code) {
                                this.$message({
                                    type: 'warning',
                                    message: err.message || err?.data?.message || ''
                                });
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                }
            },
            handleRename() {
                const { urlConfig, tableData, className } = this;

                let findData = this.tableData.find((item) => !item.rename);
                if (findData) {
                    return Promise.reject(new Error('请输入名称'));
                }

                findData = this.tableData.find((item) => !item.rename.trim());
                if (findData) {
                    return Promise.reject(new Error('名称数据格式不正确'));
                }

                findData = this.tableData.find((item) => item.rename.trim().length > 100);
                if (findData) {
                    return Promise.reject(new Error('名称长度不能超过100个字符'));
                }

                const data = tableData.map((item) => ({
                    name: item.rename.trim(),
                    oid: item.oid
                }));

                return this.$famHttp({
                    url: urlConfig.rename,
                    data,
                    className,
                    method: 'POST'
                });
            },
            handleChangeOwner() {
                const { urlConfig, tableData, className } = this;

                const findData = this.tableData.find((item) => !item.owner);
                if (findData) {
                    return Promise.reject(new Error('请输入所有者'));
                }

                const data = {};
                tableData.forEach((item) => {
                    data[item.oid] = item.owner;
                });

                return this.$famHttp({
                    url: urlConfig.ownerBy,
                    data,
                    className,
                    method: 'POST'
                });
            },
            handleSaveAs() {
                const { urlConfig, tableData, className, joinClassName } = this;

                // 只需要判断没有名称的情况，另存为可以不用重新选择上下文和文件夹
                let errData = tableData.find((item) => {
                    return joinClassName ? !item[`${className}#rename`] : !item['rename'];
                });
                if (errData) {
                    return Promise.reject(new Error('请输入修改后的名称'));
                }

                errData = this.tableData.find((item) => {
                    return joinClassName ? !item[`${className}#rename`].trim() : !item['rename'].trim();
                });
                if (errData) {
                    return Promise.reject(new Error('名称数据格式不正确'));
                }

                errData = this.tableData.find((item) => {
                    return joinClassName
                        ? item[`${className}#rename`].trim().length > 100
                        : item['rename'].trim().length > 100;
                });
                if (errData) {
                    return Promise.reject(new Error('名称长度不能超过100个字符'));
                }

                errData = tableData.find((item) => {
                    return !item.afterContext;
                });
                if (errData) {
                    return Promise.reject(new Error('请选择上下文'));
                }

                errData = tableData.find((item) => {
                    return !item.afterFolder;
                });
                if (errData) {
                    return Promise.reject(new Error('请选择文件夹'));
                }

                const data = tableData.map((item) => ({
                    name: joinClassName ? item[`${className}#rename`] : item['rename'],
                    oid: item.oid,
                    attrRawList: [
                        {
                            attrName: 'containerRef',
                            value: item.afterContext
                        }
                    ],
                    codeRule: '',
                    folderRef: item.afterFolder,
                    identifierNo: '',
                    isAddToWorkspace: false,
                    viewOid: '',
                    workspaceOid: ''
                }));

                return this.$famHttp({
                    url: urlConfig.saveAs,
                    data,
                    className,
                    method: 'POST'
                });
            },
            handleSetState() {
                const { urlConfig, tableData, className } = this;

                // 只需要判断没有名称的情况，另存为可以不用重新选择上下文和文件夹
                const errData = tableData.find((item) => {
                    return !item.state;
                });

                if (errData) {
                    return Promise.reject(new Error('请选择状态'));
                }

                const resetVoList = tableData.map((item) => ({
                    oid: item.oid,
                    stateName: item.state
                }));

                return this.$famHttp({
                    url: urlConfig.setState,
                    data: {
                        resetVoList,
                        className: this.className
                    },
                    className,
                    method: 'POST'
                });
            },
            handleMove() {
                const { urlConfig, moveData, className } = this;
                let data = moveData || {};
                // 单条数据移动
                if (!this.isBatchOperations) {
                    const oldName = this.joinClassName
                        ? this.tableData?.[0]?.[`${className}#containerName`]
                        : this.tableData?.[0]?.['containerName'];
                    data = {
                        memberList: this.tableData.map((item) => item.oid),
                        newContainerId: this.newContainerRef.split(':')[2] || '',
                        newContainerKey: this.newContainerRef.split(':')[1] || '',
                        newContainnerName: this.contextObj.name,
                        newFolderId: this.folderObj.id,
                        newFolderKey: this.folderObj.idKey,
                        oldContainnerName: oldName,
                        viewId: ''
                    };
                }
                if (!data.newContainerId) {
                    return Promise.reject(new Error('请选择上下文'));
                }
                if (!data.newFolderId) {
                    return Promise.reject(new Error('请选择文件夹'));
                }

                return this.$famHttp({
                    url: urlConfig.move,
                    data,
                    method: 'POST'
                });
            },

            toggleShow() {
                this.innerVisible = !this.innerVisible;
                this.$emit('update:visible', this.innerVisible);
                this.$emit('close');
            },
            batchModify() {
                if (this.selectedData.length == 0) {
                    this.$message({
                        type: 'warning',
                        message: this.i18n['selectData'] || ''
                    });
                    return false;
                }
                this.batchDialogVisible = true;
                if (this.type === 'setState') {
                    this.batchTitle = this.i18n.setStatus;
                } else {
                    this.batchTitle = this.i18n.modify;
                }
            },
            // 收集相关对象
            handleObject() {
                const innerTable = this.selectedData || [];
                innerTable.map((item) => {
                    let newRow = {};
                    _.each(item?.attrRawList, (ite) => {
                        newRow[ite?.attrName?.split('#')[1] || ite?.attrName] = ite?.displayName || '';
                        newRow['selected'] = true;
                    });
                    newRow['includesData'] = [item?.relationOid, item?.versionOid];
                    item['oid'] = item?.versionOid;
                    return {
                        ...newRow,
                        ...item
                    };
                });

                const props = {
                    visible: true,
                    width: '800px',
                    innerTable,
                    className: this.className,
                    title: this.i18n.collectObject
                };
                this.collectProps = props;
            },
            // 选中用户
            fnMemberSelect(row, memberIds, members) {
                row.owner = memberIds ? memberIds : '';
                row.ownerObj = memberIds ? members : [];
                row.ownerName = memberIds ? members.map((m) => m.displayName)?.join() : '';
            },
            // 搜索
            search(val) {
                ErdcKit.debounceFn(() => {
                    let [...arr] = this.tableData;
                    this.filterColumns(val, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.tableData;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                let searchArr = data;
                searchArr.forEach((e) => {
                    let { identifierNo, oldName, name } = e;
                    const rowName = e[`${this.className}#name`];
                    const id = e[`${this.className}#identifierNo`];
                    if (
                        identifierNo?.includes(res) ||
                        id?.includes(res) ||
                        oldName?.includes(res) ||
                        name?.includes(res) ||
                        rowName?.includes(res)
                    ) {
                        if (searchData.indexOf(e) == '-1') {
                            searchData.push(e);
                        }
                    }
                });

                this.viewData = searchData;
            },
            // 改变事件，返回当前选中的值
            changeContext(value, data, row) {
                row.showContext = data?.displayName || '请选择';
                row.showFolder = '请选择';
                if (this.type === 'move') {
                    this.newContainerRef = value;
                    if (data.id) {
                        this.contextObj = {
                            id: data.id,
                            idKey: data.idKey,
                            name: data.name
                        };
                    }
                }
            },
            changeFolder(data, node, vm, row) {
                row.showFolder = data?.displayName || '请选择';
                row.afterFolder = data?.oid || '';
                if (this.type === 'move' && data) {
                    this.folderObj = {
                        id: data.id,
                        idKey: data.idKey,
                        name: data.name
                    };
                }
            },
            close() {
                this.innerVisible = !this.innerVisible;
                this.$emit('close');
                this.$emit('update:visible', this.innerVisible);
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            collectSuccess(resData) {
                this.successCallback && this.successCallback(resData);
            },
            collectClose() {
                this.collectProps.visible = false;
                // dialogIns.$destroy();
                // if (this.$el.parentNode) {
                //     this.$el.parentNode.removeChild(this.$el);
                // }
            }
        }
    };
});
