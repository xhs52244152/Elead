define([
    'text!' + ELMP.func('erdc-document/components/DialogHandler/index.html'),
    ELMP.func('erdc-document/api.js'),
    'css!' + ELMP.func('erdc-document/components/DialogHandler/style.css')
], function (template, api) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'DialogHandler',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            DialogBatch: ErdcKit.asyncComponent(ELMP.func('erdc-document/components/DialogBatch/index.js')),
            FamCodeGenerator: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamCodeGenerator/index.js')),
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js')),
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
                        saveAs: '/document/saveAs',
                        ownerBy: '/fam/common/batchUpdateOwnerBy',
                        move: '/fam/folder/batchMoveObject',
                        setState: '/document/common/batchResetState'
                    };
                }
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
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                epmDocumentClassName: 'erd.cloud.pdm.epm.entity.EpmDocument',
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
                moveData: {},
                contextObj: {},
                folderObj: {},
                batchTitle: '',
                identifierNoType: 'system', //编码的生成方式
                // 收集对象
                collectForm: {
                    visible: false,
                    title: '',
                    loading: false,
                    tableData: [],
                    className: this?.className
                },
                selectedData: [],
                // 文件夹-初始默认展开第一层
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
                            className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
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
            isBatchOperations() {
                const arr = ['move', 'saveAs', 'setState', 'rename', 'owner'];
                const isFlag = this.tableData.length > 1 && arr.includes(this.type);
                return isFlag;
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
            // 复选框选中单条数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框选中全部数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            // 添加收集对象api
            addCollectObjectApi(data) {
                return this.$famHttp({
                    url: '/fam/member/add',
                    data,
                    method: 'POST'
                });
            },
            // 选中收集对象
            collectObjectClick() {
                // 选中的收集对象数据
                let tableData = this.$refs?.collectObjectsRef?.getData?.() || [];

                // 当前全量数据
                const viewData = this.tableData || [];

                if (tableData.length) {
                    for (let i = tableData.length - 1; i >= 0; i--) {
                        for (let j = 0; j < viewData.length; j++) {
                            if (tableData[i]?.oid === viewData[j]?.oid) {
                                tableData.splice(i, 1);
                            }
                        }
                    }
                }

                if (tableData.length) {
                    this.collectForm.loading = true;

                    tableData = _.map(tableData, (item) => {
                        let obj = {};
                        _.each(item?.attrRawList, (sitem) => {
                            obj[sitem.attrName] = _.isObject(sitem?.value) ? sitem?.oid : sitem?.value;
                            obj[`${this.className}` + '#' + `${sitem?.attrName}`] = _.isObject(sitem?.value)
                                ? sitem?.oid
                                : sitem?.value;
                        });

                        if (this.type === 'saveAs') {
                            obj[`${this.className}` + '#identifierNo'] = '';
                            obj['identifierNo'] = '';
                            obj['containerName'] = _.find(item?.attrRawList, { attrName: 'containerRef' })?.displayName;
                            obj[`${this.className}` + '#containerName'] = _.find(item?.attrRawList, {
                                attrName: 'containerRef'
                            })?.displayName;
                            obj['folderRef'] = _.find(item?.attrRawList, { attrName: 'folderRef' })?.displayName;
                            obj[`${this.className}` + '#folderRef'] = _.find(item?.attrRawList, {
                                attrName: 'folderRef'
                            })?.displayName;
                        } else if (this.type === 'move') {
                            obj['identifierNo'] = _.find(item?.attrRawList, { attrName: 'identifierNo' })?.displayName;
                            obj[`${this.className}` + '#identifierNo'] = _.find(item?.attrRawList, {
                                attrName: 'identifierNo'
                            })?.displayName;
                            obj['containerName'] = _.find(item?.attrRawList, { attrName: 'containerRef' })?.displayName;
                            obj[`${this.className}` + '#containerName'] = _.find(item?.attrRawList, {
                                attrName: 'containerRef'
                            })?.displayName;
                            obj['folderRef'] = _.find(item?.attrRawList, { attrName: 'folderRef' })?.displayName;
                            obj[`${this.className}` + '#folderRef'] = _.find(item?.attrRawList, {
                                attrName: 'folderRef'
                            })?.displayName;
                            obj.afterContext = '';
                            obj.showContext = '';
                        } else if (this.type === 'rename') {
                            obj['folderRef'] = _.find(item?.attrRawList, { attrName: 'folderRef' })?.displayName;
                            obj[`${this.className}` + '#folderRef'] = _.find(item?.attrRawList, {
                                attrName: 'folderRef'
                            })?.displayName;
                            obj['oldName'] = _.find(item?.attrRawList, { attrName: 'name' })?.displayName;
                            obj[`${this.className}` + '#oldName'] = _.find(item?.attrRawList, {
                                attrName: 'name'
                            })?.displayName;
                            obj['containerRef'] = _.find(item?.attrRawList, { attrName: 'containerRef' })?.displayName;
                            obj[`${this.className}` + '#containerRef'] = _.find(item?.attrRawList, {
                                attrName: 'containerRef'
                            })?.displayName;
                            obj['oldCadName'] = _.find(item?.attrRawList, { attrName: 'cadName' })?.displayName;
                            obj[`${this.className}` + '#oldCadName'] = _.find(item?.attrRawList, {
                                attrName: 'cadName'
                            })?.displayName;
                        } else if (this.type === 'setState') {
                            obj['status'] = _.find(item?.attrRawList, {
                                attrName: 'lifecycleStatus.status'
                            })?.displayName;
                            obj[`${this.className}` + '#status'] = _.find(item?.attrRawList, {
                                attrName: 'lifecycleStatus.status'
                            })?.displayName;
                        } else if (this.type === 'owner') {
                            obj['ownedByRef'] = _.find(item?.attrRawList, { attrName: 'ownedByRef' })?.displayName;
                            obj[`${this.className}` + '#ownedByRef'] = _.find(item?.attrRawList, {
                                attrName: 'ownedByRef'
                            })?.displayName;
                        }

                        return {
                            ...obj,
                            ...item
                        };
                    });

                    this.tableData = this.tableData.concat(tableData);
                    this.viewData = this.tableData;

                    this.$message.success(this.i18n['收集相关对象成功']);

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                } else {
                    this.collectForm.loading = true;

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                }
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            // 收集相关对象
            collectRelatedObjects(tableData) {
                if (!tableData.length) {
                    return this.$message.info(this.i18n['请勾选对象']);
                }
                this.popover({
                    field: 'collectForm',
                    visible: true,
                    title: this.i18n['收集相关对象'],
                    callback: () => {
                        this.collectForm.tableData = ErdcKit.deepClone(tableData) || [];
                    }
                });
            },
            // 文件夹配置
            getFolderRow(row) {
                return {
                    componentName: 'virtual-select', // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                    requestConfig: {
                        // 请求接口的配置对象
                        url: '/fam/listAllTree',
                        params: {
                            className: 'erd.cloud.foundation.core.folder.entity.SubFolder',
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
                            rowData = { ...item, ...rowData };
                        });
                    } else {
                        rowData = { ...item };
                    }

                    /**
                     * TODO: 传入DialogHandler数据格式应该是统一的，所以关于数据的处理应该放到调用外。
                     * 目前暂时放到
                     */

                    const containerRefObj = _.find(rowData?.attrRawList, (item) =>
                        new RegExp('containerRef$').test(item?.attrName)
                    );
                    rowData['containerName'] = containerRefObj?.displayName || '';
                    rowData['containerRef'] =
                        this.type === 'rename' ? containerRefObj?.displayName : containerRefObj?.oid;
                    rowData[`${this.className}#containerName`] = containerRefObj?.displayName || '';
                    rowData[`${this.className}#containerRef`] =
                        this.type === 'rename' ? containerRefObj?.displayName : containerRefObj?.oid;

                    const ownedByRefObj = _.find(rowData?.attrRawList, (item) =>
                        new RegExp('ownedByRef$').test(item?.attrName)
                    );
                    rowData['ownedByRef'] = ownedByRefObj?.displayName || '';
                    rowData[`${this.className}#ownedByRef`] = ownedByRefObj?.displayName || '';

                    if (this.type === 'saveAs') {
                        // 默认文件夹
                        let folderData = _.find(rowData?.attrRawList, (item) =>
                            new RegExp('folderRef$').test(item?.attrName)
                        );
                        this.$set(rowData, `${this.className}#rename`, item[`${this.className}#rename`]);
                        this.$set(rowData, 'rename', item['rename']);
                        this.$set(rowData, 'showContext', rowData.containerName);
                        this.$set(rowData, 'afterContext', rowData.containerRef);
                        this.$set(rowData, 'showFolder', folderData.displayName);
                        this.$set(rowData, 'afterFolder', folderData.value);
                        this.$set(rowData, `${this.className}#identifierNo`, '');
                        this.$set(rowData, 'identifierNo', '');
                    }

                    rowData.oid = item.oid;

                    return { ...item, ...rowData };
                });

                this.viewData = this.tableData;

                if (this.type === 'setState') this.getStateData();
                //另存为
                // if (this.type === 'saveAs') this.handleGetLayoutByType();
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
                        // TODO 参与者组件暂不支持自动打开面板
                        // this.$refs.ownerRef?.focusInput();
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
            // eslint-disable-next-line no-unused-vars
            onChange(data) {},
            changeState(value, data, row) {
                const res = this?.stateList?.find((item) => item.value == value) || {};
                if (row) {
                    this.$set(row, 'stateName', res.displayName);
                }
            },
            //处理-选中需要批量修改属性的数据
            handleEchoData(item, attr) {
                let { selectedData } = this;
                // BA说批量移动先不校验，默认就是当前表格数据
                if (['move'].includes(this.type)) {
                    selectedData = this.tableData;
                }

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
                this?.$refs['erdTable']?.clearCheckboxRow();
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
                            this.$message({
                                type: 'warning',
                                message: err.message || err?.data?.message || ''
                            });
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                }
            },
            handleRename() {
                const { urlConfig, tableData, className, isEpm } = this;
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

                if (className === this.epmDocumentClassName) {
                    findData = this.tableData.find((item) => isEpm(item) && !item.newCadName);
                    if (findData) {
                        return Promise.reject(new Error('请输入新CAD文件名称'));
                    }

                    findData = this.tableData.find((item) => isEpm(item) && !item.newCadName.trim());
                    if (findData) {
                        return Promise.reject(new Error('新CAD文件名称数据格式不正确'));
                    }

                    findData = this.tableData.find((item) => isEpm(item) && item.newCadName.trim().length > 100);
                    if (findData) {
                        return Promise.reject(new Error('新CAD文件名称长度不能超过100个字符'));
                    }
                }

                const data = tableData.map((item) => ({
                    name: item.rename.trim(),
                    oid: item.versionOid || item.oid,
                    cadName:
                        className === this.epmDocumentClassName && isEpm(item)
                            ? item.newCadName.trim() + this.getDocType(item.oldCadName)
                            : undefined
                }));

                return this.$famHttp({
                    url: urlConfig.rename,
                    data,
                    className,
                    method: 'POST',
                    errorMessage: false
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
                    data[item.versionOid || item.oid] = item.owner;
                });

                return this.$famHttp({
                    url: urlConfig.ownerBy,
                    data,
                    className,
                    method: 'POST',
                    errorMessage: false
                });
            },
            handleSaveAs() {
                const { urlConfig, tableData, className, joinClassName, isEpm } = this;

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

                //判断编码
                errData = tableData.find((item) => {
                    if (joinClassName) {
                        //除系统默认之外须要校验必填
                        if (item['typeNameClassName'] !== 'system') {
                            return joinClassName ? !item[`${className}#identifierNo`] : !item['identifierNo'];
                        } else {
                            return false;
                        }
                    }
                });
                //除系统默认之外的配置都要校验非必填
                if (errData && this.identifierNoType !== 'system') {
                    this.$message.warning('请输入新编码');
                    this.loading = false;
                    return false;
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

                if (className === this.epmDocumentClassName) {
                    errData = this.tableData.find((item) => !item.newCadName);
                    if (errData) {
                        return Promise.reject(new Error('请输入新CAD文件名称'));
                    }

                    errData = this.tableData.find((item) => !item['newCadName']?.trim());
                    if (errData) {
                        return Promise.reject(new Error('新CAD文件名称数据格式不正确'));
                    }

                    errData = this.tableData.find((item) => item['newCadName']?.trim().length > 100);
                    if (errData) {
                        return Promise.reject(new Error('新CAD文件名称长度不能超过100个字符'));
                    }
                }
                const cadNameAtt = this.joinClassName ? `${className}#cadName` : 'cadName';

                const data = tableData.map((item) => {
                    let obj = {
                        name: joinClassName ? item[`${className}#rename`].trim() : item['rename'].trim(),
                        oid: item.versionOid || item.oid,
                        attrRawList: [
                            {
                                attrName: 'containerRef',
                                value: item.afterContext
                            }
                        ],
                        codeRule: '',
                        folderRef: item.afterFolder,
                        identifierNo: this.getIdentifierNo(item),
                        isAddToWorkspace: false,
                        viewOid: '',
                        workspaceOid: ''
                    };

                    if (className === this.epmDocumentClassName && isEpm(item)) {
                        obj.attrRawList.push({
                            attrName: 'cadName',
                            value: item.newCadName.trim() + this.getDocType(item[cadNameAtt])
                        });
                    }
                    return obj;
                });

                return this.$famHttp({
                    url: urlConfig.saveAs,
                    data,
                    className,
                    method: 'POST',
                    errorMessage: false
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
                    oid: item.versionOid || item.oid,
                    stateName: item.state
                }));

                return this.$famHttp({
                    url: urlConfig.setState,
                    data: {
                        resetVoList,
                        className: this.className
                    },
                    className,
                    method: 'POST',
                    errorMessage: false
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
                        memberList: this.tableData.map((item) => item.versionOid || item.oid),
                        newContainerId: this.contextObj.containerRef?.split(':')[2],
                        newContainerKey: this.contextObj.containerRef?.split(':')[1],
                        newContainnerName: this.contextObj.name,
                        newFolderId: this.folderObj.id,
                        newFolderKey: this.folderObj.idKey,
                        oldContainnerName: oldName,
                        viewId: ''
                    };

                    if (!data.newContainerId) {
                        return Promise.reject(new Error('请选择上下文'));
                    }

                    if (!data.newFolderId) {
                        return Promise.reject(new Error('请选择文件夹'));
                    }
                } else {
                    if (_.isEmpty(moveData)) {
                        let list = [];
                        for (let i = 0; i < this.tableData.length; i++) {
                            const oldName = this.joinClassName
                                ? this.tableData?.[i]?.[`${className}#containerName`]
                                : this.tableData?.[i]?.['containerName'];
                            data = {
                                memberList: [this.tableData[i].versionOid || this.tableData[i].oid],
                                newContainerId: this.tableData[i]?.afterContext?.split(':')[2],
                                newContainerKey: this.tableData[i]?.afterContext?.split(':')[1],
                                newContainnerName: this.tableData[i]?.showContext,
                                newFolderId: this.tableData[i]?.afterFolder?.split(':')[2],
                                newFolderKey: this.tableData[i]?.afterFolder?.split(':')[1],
                                oldContainnerName: oldName,
                                viewId: ''
                            };

                            if (!data.newContainerId) {
                                return Promise.reject(new Error('请选择上下文'));
                            }

                            if (!data.newFolderId) {
                                return Promise.reject(new Error('请选择文件夹'));
                            }

                            list.push(
                                this.$famHttp({
                                    url: urlConfig.move,
                                    data,
                                    method: 'POST',
                                    errorMessage: false
                                })
                            );
                        }

                        return Promise.all([...list]);
                    } else {
                        if (!data.newContainerId) {
                            return Promise.reject(new Error('请选择上下文'));
                        }

                        if (!data.newFolderId) {
                            return Promise.reject(new Error('请选择文件夹'));
                        }
                    }
                }

                return this.$famHttp({
                    url: urlConfig.move,
                    data,
                    method: 'POST',
                    errorMessage: false
                });
            },

            toggleShow() {
                this.innerVisible = !this.innerVisible;
                this.$emit('update:visible', this.innerVisible);
                this.$emit('close');
            },
            batchModify() {
                // BA说批量移动先不校验，默认就是当前表格数据
                if (!['move'].includes(this.type) && this.selectedData.length == 0) {
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
            handleObject() {
                const selectedData = ErdcKit.deepClone(this.selectedData) || [];
                this.collectRelatedObjects(selectedData);
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
            changeContext(row, value, data) {
                for (let i = 0; i < this.tableData.length; i++) {
                    if (this.tableData[i]?.oid === row?.oid) {
                        !_.isEmpty(data) &&
                            this.$set(this.tableData, i, {
                                ...this.tableData[i],
                                showContext: data?.displayName || this.tableData[i]?.showContext || '请选择',
                                showFolder: '请选择'
                            });
                        break;
                    }
                }

                if (this.type === 'move' && !_.isEmpty(data)) {
                    const contextObj = {
                        id: data?.id || this.contextObj?.id || '',
                        idKey: data?.idKey || this.contextObj?.idKey || '',
                        name: data?.name || this.contextObj?.name || '',
                        containerRef: data?.containerRef || ''
                    };

                    _.each(contextObj, (value, key) => {
                        this.$set(this.contextObj, key, value);
                    });
                }
            },
            // eslint-disable-next-line no-unused-vars
            changeFolder(row, data, node, vm) {
                for (let i = 0; i < this.tableData.length; i++) {
                    if (this.tableData[i]?.oid === row?.oid) {
                        !_.isEmpty(data) &&
                            this.$set(this.tableData, i, {
                                ...this.tableData[i],
                                showFolder: data?.displayName || this.tableData[i]?.showFolder || '请选择',
                                afterFolder: data?.oid || this.tableData[i]?.afterFolder || ''
                            });
                        break;
                    }
                }

                if (this.type === 'move' && !_.isEmpty(data)) {
                    const folderObj = {
                        id: data?.id || this.folderObj?.id || '',
                        idKey: data?.idKey || this.folderObj?.idKey || '',
                        name: data?.name || this.folderObj?.name || ''
                    };

                    _.each(folderObj, (value, key) => {
                        this.$set(this.folderObj, key, value);
                    });
                }
            },
            close() {
                this.innerVisible = !this.innerVisible;
                this.$emit('close');
                this.$emit('update:visible', this.innerVisible);
            },
            // 获取文件类型
            getDocType(name) {
                return name ? '.' + name.split('.')[name.split('.').length - 1] : '';
            },
            //取布局配置，根据布局配置，设置编码的设置方式
            getLayoutByType(typeNameClassName) {
                return this.$famHttp({
                    url: '/fam/type/layout/getLayoutByType',
                    data: {
                        className: typeNameClassName,
                        layoutType: 'CREATE',
                        name: 'CREATE'
                    },
                    method: 'POST'
                });
            },
            getIdentifierNo(item) {
                //如果是system，表示是系统默认置为空，反之其他类型取编码框的值
                if (this.identifierNoType == 'system') {
                    return '';
                } else {
                    return this.joinClassName
                        ? item[`${this.className}#identifierNo`].trim()
                        : item['identifierNo'].trim();
                }
            },
            async handleGetLayoutByType() {
                let tmpObj = [];
                for (const data of this.viewData) {
                    //取类型的value
                    let typeNameOptions = {};
                    //joinClassName false是详情页面进入，true是列表页面进入
                    if (!this.joinClassName) {
                        typeNameOptions.value = data.typeName;
                    } else {
                        typeNameOptions = data.attrRawList.find(
                            (item) => item.attrName == `${this.className}#typeName`
                        );
                    }
                    let layoutByType = await this.getLayoutByType(typeNameOptions.value);
                    //取编码的配置项
                    let numberOptions = layoutByType.data.layoutAttrList.find(
                        (item) => item.attrName == 'identifierNo'
                    );
                    let componentJson = numberOptions?.componentJson;
                    componentJson = JSON.parse(componentJson);
                    let concatData = ErdcKit.deepClone({
                        ...data,
                        typeNameClassName: componentJson?.schema?.props?.type || 'system'
                    });
                    tmpObj.push(concatData);
                }
                this.viewData = tmpObj;
            },
            // 判断是否为模型对象
            isEpm(row) {
                return row.idKey?.indexOf('EpmDocument') != -1 || row.typeName?.indexOf('EpmDocument') != -1;
            },
            // 单元格点击编辑
            activeCellMethod({ row, column }) {
                if (column.field === 'newCadName' || column.field === `${this.className}#newCadName`) {
                    return this.isEpm(row);
                } else {
                    return true;
                }
            }
        }
    };
});
