define([
    'erdcloud.kit',
    'erdc-kit',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-plan/components/DeliveryDetails/index.html'),
    ELMP.resource('project-plan/mixins/common-mixins.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('project-plan/components/DeliveryDetails/index.css')
], function (ErdcKit, famUtils, store, template, commonMixins, utils, actions, commonHttp) {
    const TreeUtil = require('fam:kit').TreeUtil;
    const listComponent = {
        name: 'DeliverList_component',
        template: template,
        mixins: [commonMixins],
        props: {
            poid: String,
            containerRefOid: String,
            deliveryTableKey: String,
            isTemplate: Boolean,
            // 关联的项目oid
            relationProjectOid: String,
            currentName: String
        },
        data() {
            return {
                readonly: false,
                btnFlag: true,
                showTableFlag: false,
                selectList: [],
                showAddList: false, // 显示列表还是表单数据
                showTableList: false,
                i18nMappingObj: {
                    edit: this.getI18nByKey('edit'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter'),
                    pleaseSelect: this.getI18nByKey('pleaseSelect'),
                    pleaseUpload: this.getI18nByKey('pleaseUpload'),
                    enable: this.getI18nByKey('enable'),
                    disable: this.getI18nByKey('disable'),
                    cancel: this.getI18nByKey('cancel'),
                    delete: this.getI18nByKey('delete'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    pleaseCheckSelect: this.getI18nByKey('pleaseSelectData'),
                    confirm: this.getI18nByKey('confirm'),
                    checkDelete: this.getI18nByKey('deleteConfirm'),
                    saveSuccessful: this.getI18nByKey('saveSuccessful'),
                    pleaseEnterDeliverableName: this.getI18nByKey('pleaseEnterDeliverableName'),
                    saveSuccess: this.getI18nByKey('saveSuccess'),
                    whetherDeleteDeliverables: this.getI18nByKey('whetherDeleteDeliverables'),
                    addDeliverables: this.getI18nByKey('addDeliverables'),
                    templateReference: this.getI18nByKey('templateReference'),
                    createDeliverables: this.getI18nByKey('createDeliverables'),
                    deselectData: this.getI18nByKey('deselectData')
                },
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                state: '', // 表单状态
                taskOid: '',
                taskOBj: {},
                title: '',
                statusOptions: [],
                className: 'erd.cloud.ppm.common.entity.Delivery',
                deliveryTypeOptions: [],
                deliveryOid: '',
                editDeliveryData: [],
                selectType: 'checkbox',
                editRow: {},
                updateBeforeTableData: [],
                selectedData: [],
                typeDictName: 'deliveryType', // 类型数据字典查询标识
                relationProjectInfos: null, // 关联的项目信息
                objectInfo: null, // 所属object对象信息
                loadings: {}
            };
        },
        computed: {
            audOptions() {
                return [
                    {
                        label: this.i18nMappingObj.enable,
                        value: true
                    },
                    {
                        label: this.i18nMappingObj.disable,
                        value: false
                    }
                ];
            },
            slotsField() {
                return [
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#name',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#name',
                        type: 'content'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#auditingFlag',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#template',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#lifecycleStatus.status',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#templateReference',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#typeRef',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.common.entity.Delivery#objectRef',
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            viewTableConfig() {
                let _this = this;
                let requestData = {
                    conditionDtoList: [
                        {
                            attrName: 'erd.cloud.ppm.common.entity.Delivery#objectRef',
                            oper: 'EQ',
                            value1: this.poid
                        }
                    ]
                };
                if (this.$route.query.baselined) {
                    requestData.baselined = '';
                }
                let config = {
                    tableKey: 'DeliverView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: requestData,
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }

                                    // 类型数据格式转换
                                    resData?.data?.records?.forEach((row) => {
                                        row.attrRawList.forEach((item) => {
                                            if (item.attrName === 'erd.cloud.ppm.common.entity.Delivery#typeRef') {
                                                item.displayName = item.oid;
                                            }
                                        });
                                        _this.loadings[row.oid] = true;
                                    });
                                    return resData;
                                }
                            ]
                        },
                        headerRequestConfig: {
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }

                                    // 名称列设置为expand
                                    resData?.data?.headers?.forEach((item) => {
                                        if (item.attrName === 'erd.cloud.ppm.common.entity.Delivery#name') {
                                            item.type = 'expand';
                                        }
                                    });
                                    return resData;
                                }
                            ]
                        },
                        tableBaseConfig: {
                            expandConfig: {
                                toggleMethod: _this.toggleExpandMethod
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: 'PPM_D_Delivery_list_OP_MENU',
                                objectOid: this.poid,
                                isDefaultBtnType: true,
                                className: 'erd.cloud.ppm.common.entity.Delivery'
                            }
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 80
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: () => {
                                // 超链接事件
                            }
                        },
                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        },
                        customColums: (columns) => {
                            _.each(columns, (item) => {
                                // 删除fixed属性，拖动会导致样式问题
                                if (item.fixed) _this.$delete(item, 'fixed');
                            });
                            return columns;
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            defaultTableHeight() {
                return document.body.clientHeight - 242;
            },
            deliveryLink() {
                return store.state.classNameMapping.DeliveryLink;
            },
            // 所属任务
            belongName() {
                if (!this.objectInfo?.identifierNo) {
                    return '';
                }
                return `${this.objectInfo?.identifierNo},${this.objectInfo?.name}`;
            },
            enableScrollLoad() {
                return true;
            }
        },
        watch: {
            relationProjectOid: {
                handler(val) {
                    this.relationProjectInfos = null;
                    if (val) {
                        this.$famHttp({
                            method: 'GET',
                            url: '/ppm/attr',
                            className: store.state.classNameMapping.project,
                            params: {
                                oid: val
                            }
                        }).then((res) => {
                            let data = res?.data?.rawData || {};
                            this.relationProjectInfos = utils.newDeserializeAttr(data);
                        });
                    }
                },
                immediate: true
            },
            poid: {
                handler(val) {
                    this.objectInfo = null;
                    if (val) {
                        this.$famHttp({
                            method: 'GET',
                            url: '/ppm/attr',
                            className: store.state.classNameMapping.task,
                            params: {
                                oid: val
                            }
                        }).then((res) => {
                            let data = res?.data?.rawData || {};
                            this.objectInfo = utils.newDeserializeAttr(data);
                        });
                    }
                },
                immediate: true
            }
        },
        created() {
            this.getDeliveryTypeOptions();
        },
        activated() {
            this.refreshTable();
        },
        methods: {
            // 模板上传
            uploadTemplate(fileObj, scope) {
                const fileVal = fileObj?.response?.data;
                if (fileVal) {
                    this.$set(scope.row, 'erd.cloud.ppm.common.entity.Delivery#template', `${fileVal}|${fileObj.name}`);
                }
            },
            showTemplateFileName(row) {
                const fileItem = row['erd.cloud.ppm.common.entity.Delivery#template'];
                const commaIndex = fileItem?.indexOf('|');
                if (commaIndex < 0) {
                    return;
                }
                return fileItem?.substring(commaIndex + 1);
            },
            // 文件预览
            filePreview(row) {
                const fileItem = row['erd.cloud.ppm.common.entity.Delivery#template'];
                const commaIndex = fileItem.indexOf('|');
                if (commaIndex < 0) {
                    return;
                }
                const fileId = fileItem.substring(0, commaIndex);
                const fileName = fileItem.substring(commaIndex + 1);
                let authCode =
                    row.attrRawList?.find(
                        (item) => item.attrName === 'erd.cloud.ppm.common.entity.Delivery#templateAuthorizeCode'
                    )?.value || '';
                if (!authCode) {
                    // 根据oid查询其详情authCode
                    commonHttp
                        .commonAttr({
                            data: {
                                oid: row.oid
                            }
                        })
                        .then((res = {}) => {
                            let detailData = res.data?.rawData || {};
                            authCode = detailData['templateAuthorizeCode']?.value;
                        });
                }
                setTimeout(() => {
                    famUtils.previewFile({
                        fileName,
                        fileId,
                        authCode
                    });
                }, 500);
            },
            // 文件下载
            fileDownload(row) {
                let fileItem = row['erd.cloud.ppm.common.entity.Delivery#template'];
                let fileId;
                let authCode =
                    ErdcKit.deserializeAttr(row.attrRawList)[
                        'erd.cloud.ppm.common.entity.Delivery#templateAuthorizeCode'
                    ] || '';
                // 如果找不到文件id和authCode就请求详情去获取，一般情况是创建交付件确定后下载是拿不到的，需要重新获取详情
                if (fileItem && authCode) {
                    const commaIndex = fileItem.indexOf('|');
                    if (commaIndex < 0) {
                        return;
                    }
                    fileId = fileItem.substring(0, commaIndex);
                } else {
                    this.$famHttp({
                        method: 'GET',
                        url: '/ppm/attr',
                        className: store.state.classNameMapping.project,
                        params: {
                            oid: row.oid
                        }
                    }).then((res) => {
                        let data = res?.data?.rawData || {};
                        let rowAttrData = utils.newDeserializeAttr(data);
                        fileId = rowAttrData.template.indexOf('|');
                        authCode = rowAttrData.templateAuthorizeCode;
                    });
                }
                famUtils.downloadFile(fileId, authCode);
            },
            removeFile(row) {
                this.$confirm(this.i18nMappingObj.whetherDeleteTemplate, this.i18nMappingObj.checkDelete, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.comfirmSelect,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$set(row, 'erd.cloud.ppm.common.entity.Delivery#template', '');
                });
            },
            renderTableCallback() {
                this.$refs.deliverList &&
                    this.$refs.deliverList.$refs.FamAdvancedTable.$refs.erdTable.$table.setAllRowExpand(true);
            },
            toggleExpandMethod({ expanded, row }) {
                if (expanded) {
                    this.getDeliverable({ row });
                }
                return true;
            },
            // 创建交付件
            bindingDeliverables() {
                let tableData = this.$refs.uploadTable.tableData;
                if (!tableData.length) return (this.showTableList = false);
                let { taskOid, createLink, deliveryLink } = this;
                let selectedOids = tableData.map((item) => {
                    return item.masterRef;
                });
                createLink(taskOid, selectedOids, deliveryLink, 'PPM').then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18nMappingObj.saveSuccessful
                    });
                    this.createDeliveryCancel();
                    this.refreshTable();
                });
            },
            createDeliveryCancel() {
                this.$refs.uploadTable.tableData = [];
                this.showTableList = false;
                this.refreshTable();
            },
            refreshTable() {
                this.$refs.deliverList.refreshTable('default');
            },
            onCommand(data, row) {
                const eventClick = {
                    PPM_D_DELIVERY_UPDATE: this.editDelivery,
                    PPM_D_DELIVERY_DELETE: this.deleteDelivery,
                    PPM_D_DELIVERY_LINK_CREATE: this.handlerCreate,
                    PPM_D_DELIVERY_LINK_ADD: this.handlerAddDelivery
                };
                eventClick[data.name] && eventClick[data.name](row, 'checkbox');
            },
            updateTableVisible() {},
            deleteDeliverySuccess(row) {
                this.getDeliverable({ row });
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_D_Delivery_PER_OP_MENU',
                    objectOid: this.$route.query?.baselined ? this.poid : row.oid,
                    className: this.className
                };
            },
            actionClick(data) {
                const eventClick = {
                    PPM_D_DELIVERY_CREATE: this.createRow,
                    PPM_D_DELIVERY_DELETE: this.batchDelete,
                    PPM_D_DELIVERY_BATCH_INITIATION_PROCESS: this.startProcess
                };
                eventClick[data.name] && eventClick[data.name]();
            },
            saveData(row) {
                if (!row['erd.cloud.ppm.common.entity.Delivery#name'].trim()) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseEnterDeliverableName
                    });
                }
                let keys = [
                    'erd.cloud.ppm.common.entity.Delivery#name',
                    'erd.cloud.ppm.common.entity.Delivery#auditingFlag',
                    'erd.cloud.ppm.common.entity.Delivery#typeRef',
                    'erd.cloud.ppm.common.entity.Delivery#lifecycleStatus.status',
                    'erd.cloud.ppm.common.entity.Delivery#templateReference',
                    'erd.cloud.ppm.common.entity.Delivery#template'
                ];
                let reqMethod = row.isEdit ? this.updateRequest : this.createRequest;
                let attrRawList = [
                    {
                        attrName: 'objectRef',
                        value: this.poid
                    }
                ];
                for (let key of keys) {
                    attrRawList.push({
                        attrName: key.split('#')[1],
                        value:
                            key === 'erd.cloud.ppm.common.entity.Delivery#templateReference'
                                ? row?.selectedData?.[0]?.oid || ''
                                : row[key]
                    });
                }
                let attrdata = {
                    attrRawList: attrRawList,
                    className: this.className,
                    containerRef: this.relationProjectInfos?.containerRef || utils.getContainerRef()
                };
                // 关联的项目
                if (this.relationProjectOid) {
                    attrdata['folderRef'] = this.relationProjectInfos?.cabinetRef;
                    attrRawList.push({
                        attrName: 'domainRef',
                        value: this.relationProjectInfos?.domainRef
                    });
                }
                row.isEdit ? (attrdata['oid'] = row.oid || row['erd.cloud.ppm.common.entity.Delivery#oid']) : '';
                reqMethod(attrdata)
                    .then((resp) => {
                        if (resp.code === '200') {
                            let params = {
                                successionType: 'SET_STATE',
                                branchIdList: [resp.data],
                                className: this.className
                            };
                            this.statesRequest(params).then((res) => {
                                if (res.code === '200') {
                                    let statusOptions = res.data;
                                    let auditingFlagDisplayName = this.audOptions.find(
                                        (item) => item.value == row['erd.cloud.ppm.common.entity.Delivery#auditingFlag']
                                    )?.label;
                                    let statusDisplayName = row.isEdit
                                        ? statusOptions[resp.data].filter((item) => {
                                              return (
                                                  item.name ==
                                                  row['erd.cloud.ppm.common.entity.Delivery#lifecycleStatus.status']
                                              );
                                          })[0]?.displayName
                                        : statusOptions[resp.data][0].displayName;
                                    let currentRowInfo = {
                                        'oid': resp.data,
                                        'isEdit': false,
                                        'erd.cloud.ppm.common.entity.Delivery#auditingFlag': auditingFlagDisplayName,
                                        'erd.cloud.ppm.common.entity.Delivery#lifecycleStatus.status': statusDisplayName
                                    };
                                    if (row.attrRawList) {
                                        const displayNameMap = {
                                            'auditingFlag': auditingFlagDisplayName,
                                            'lifecycleStatus.status': statusDisplayName
                                        };
                                        let attrRawList = attrdata.attrRawList;
                                        row.attrRawList = row.attrRawList?.map((item) => {
                                            const needChangeValueKeys = ['displayName', 'tooltip', 'value'];

                                            let currentObj = attrRawList.find(
                                                (attr) => item.attrName === this.className + '#' + attr.attrName
                                            );
                                            if (currentObj) {
                                                needChangeValueKeys.forEach((key) => {
                                                    if (['name', 'template'].includes(currentObj.attrName)) {
                                                        item[key] = currentObj.value;
                                                    } else {
                                                        if (key === 'value') {
                                                            item[key] = currentObj[key];
                                                        } else
                                                            item[key] =
                                                                displayNameMap[currentObj.attrName] || item[key];
                                                    }
                                                });
                                            }
                                            return item;
                                        });
                                    }
                                    row = $.extend(row, currentRowInfo);
                                    this.refreshDeliverTableData(row);
                                    this.$message({
                                        type: 'success',
                                        message: this.i18nMappingObj.saveSuccess,
                                        showClose: true
                                    });
                                    // this.refreshTable();
                                }
                            });
                            // this.$set(row, 'oid', resp.data);
                            // this.$set(row, 'isEdit', false);
                            // this.$set(
                            //     row,
                            //     'erd.cloud.ppm.common.entity.Delivery#name',
                            //     row['erd.cloud.ppm.common.entity.Delivery#name']
                            // );
                            // this.refreshTable();
                        }
                    })
                    .catch(() => {
                        // this.$message({ type: 'error', message: error.data.message, showClose: true });
                    });
            },
            cancelSaveData(row) {
                let listTableData = this.$refs.deliverList.$refs.FamAdvancedTable.tableData;
                if (row.oid) {
                    let oldData = this.updateBeforeTableData.find((item) => item.oid === row.oid);
                    for (let key of Object.keys(row)) {
                        let value =
                            oldData.attrRawList?.find((item) => item.attrName === key)?.displayName || oldData[key];
                        this.$set(row, key, value);
                    }
                    this.$set(row, 'isEdit', false);
                } else {
                    this.$refs.deliverList.$refs.FamAdvancedTable.tableData = listTableData.filter(
                        (item) => item['_X_ROW_KEY'] !== row['_X_ROW_KEY']
                    );
                }
            },
            editDelivery(row) {
                if (!this.updateBeforeTableData.filter((item) => item.isEdit).length) {
                    this.updateBeforeTableData = JSON.parse(
                        JSON.stringify(this.$refs.deliverList.$refs.FamAdvancedTable.tableData)
                    );
                }
                this.$set(
                    row,
                    'erd.cloud.ppm.common.entity.Delivery#auditingFlag',
                    row['erd.cloud.ppm.common.entity.Delivery#auditingFlag'] === this.i18nMappingObj.enable
                );
                this.getStatusOptions(row);
                this.$set(row, 'isEdit', true);
            },
            deleteDelivery(row) {
                let params = {
                    category: 'DELETE',
                    oidList: [row.oid],
                    className: row.idKey
                };
                this.deleteData(params);
            },
            createRow() {
                let listTableData = this.$refs.deliverList.$refs.FamAdvancedTable.tableData;
                let typeRef = this.deliveryTypeOptions[0]?.value || '';
                listTableData.unshift({
                    'erd.cloud.ppm.common.entity.Delivery#name': '',
                    'erd.cloud.ppm.common.entity.Delivery#auditingFlag': false,
                    'erd.cloud.ppm.common.entity.Delivery#typeRef': typeRef,
                    'erd.cloud.ppm.common.entity.Delivery#lifecycleStatus.status': '',
                    'erd.cloud.ppm.common.entity.Delivery#objectRef': this.currentName || this.belongName || ''
                });
                this.$refs.deliverList.$refs.FamAdvancedTable.$refs.erdTable.$table.toggleRowExpand(listTableData[0]);
            },
            // 刷新交付件数据
            refreshDeliverTableData(row) {
                this.getDeliverable({ row });
            },
            changeBtn(val) {
                if (val) {
                    this.showTableFlag = true;
                }
            },
            // 复选框全选
            selectAllEvent(data) {
                this.selectList = data.records;
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
            },
            // 批量删除
            batchDelete() {
                if (!this.selectList.length) {
                    this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseCheckSelect
                    });
                    return;
                }
                let oidList = this.selectList.map((item) => {
                    return item.oid;
                });
                // 存在undefined是创建后没有保存导致id拿不到
                if (oidList.includes(undefined)) {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.deselectData
                    });
                    return;
                }
                let params = {
                    category: 'DELETE',
                    oidList,
                    className: this.selectList[0]?.idKey
                };
                this.deleteData(params, 'batch');
            },
            deleteData(params, type = '') {
                this.$confirm(this.i18nMappingObj.whetherDeleteDeliverables, this.i18nMappingObj.checkDelete, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.deleteByIdsRequest(params).then((resp) => {
                        if (resp.success) {
                            this.refreshTable();
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess
                            });
                            if (type === 'batch') {
                                this.selectList = [];
                            }
                        }
                    });
                });
            },
            handlerAddDelivery(row, type) {
                this.selectType = type;
                this.taskOid = row.oid;
                this.showAddList = true;
                this.title =
                    type === 'checkbox' ? this.i18nMappingObj.addDeliverables : this.i18nMappingObj.templateReference;
                this.editRow = row;
                if (row.isEdit) {
                    this.selectedData = _.filter(row.attrRawList, {
                        attrName: 'erd.cloud.ppm.common.entity.Delivery#templateReference'
                    });
                } else {
                    this.selectedData = row.selectedData || [];
                }
            },
            handlerCreate(row) {
                this.taskOid = row.oid;
                this.title = this.i18nMappingObj.createDeliverables;
                this.showTableList = true;
            },
            handlerCancel(row, data) {
                let listTableData = this.$refs.deliverList.$refs.FamAdvancedTable.tableData;
                const index = data.rowIndex + 1;
                listTableData.splice(0, index);
            },
            handlerDelete(row, data) {
                let listTableData = this.$refs.deliverList.$refs.FamAdvancedTable.tableData;
                const index = data.rowIndex + 1;
                listTableData.splice(0, index);
            },
            getValueMeth(row, slot) {
                const { idKey } = row;
                const slotArr = slot.match(/#(\S*):/);
                const slotStr = slotArr ? `${idKey}#${slotArr[1]}` : '';
                return row[slotStr];
            },
            edit() {
                this.state = 'edit';
                this.showList = false;
            },
            addDeliver() {
                let { taskOid, createLink, deliveryLink, editRow } = this;
                let { source, selectData } = this.$refs.addDeliver.getSelected();

                if (!selectData.length) {
                    return this.$message.info(this.i18n.pleaseSelectData);
                }
                if (this.selectType === 'checkbox') {
                    let selectedOids = selectData.map((item) => item.masterRef);
                    // 调接口并关闭
                    createLink(taskOid, selectedOids, deliveryLink, source).then(() => {
                        this.showAddList = false;
                        this.renderTableCallback();
                        this.refreshDeliverTableData(editRow);
                    });
                } else {
                    this.editRow['erd.cloud.ppm.common.entity.Delivery#templateReference'] = selectData[0].name;
                    this.editRow.selectedData = selectData;
                    this.showAddList = false;
                }
            },
            /**
             * 创建父子关系
             * @param {String} parentRef
             * @param {Array[String]} childrenRefs
             * @param {String} className
             * @param {String} source 来源PPM / PDM
             */
            createLink(parentRef, childrenRefs = [], className, source) {
                const _this = this;
                return new Promise((resolve) => {
                    let rawDataVoList = childrenRefs.map((child) => {
                        return {
                            attrRawList: [
                                {
                                    attrName: 'roleAObjectRef',
                                    value: parentRef
                                },
                                {
                                    attrName: 'roleBObjectRef',
                                    value: child
                                }
                            ].concat(
                                source
                                    ? {
                                          attrName: 'source',
                                          value: source
                                      }
                                    : []
                            )
                        };
                    });
                    let params = {
                        className,
                        rawDataVoList
                    };
                    _this.$loading();
                    this.saveOrUpdateRequest(params)
                        .then((resp) => {
                            // _this.$message.success('操作成功');
                            resolve(resp);
                        })
                        .finally(() => {
                            _this.$loading().close();
                        });
                });
            },
            getDeliveryTypeOptions() {
                this.$famHttp({
                    method: 'GET',
                    url: '/fam/dictionary/tree/' + this.typeDictName,
                    params: {
                        status: 1
                    }
                }).then((resp) => {
                    this.deliveryTypeOptions = resp?.data || [];
                });
            },
            getStatusOptions(row) {
                let oid = row.oid || row['erd.cloud.ppm.common.entity.Delivery#oid'];
                let params = {
                    successionType: 'SET_STATE',
                    branchIdList: [oid],
                    className: this.className
                };
                this.statesRequest(params)
                    .then((res) => {
                        let stateKey = 'erd.cloud.ppm.common.entity.Delivery#lifecycleStatus.status';
                        let state = row[stateKey];
                        this.statusOptions = res.data[oid].map((item) => {
                            return {
                                label: item.displayName,
                                value: item.name
                            };
                        });
                        row[stateKey] = this.statusOptions.find((item) => item.label === state).value;
                    })
                    .catch((error) => {
                        this.$message({
                            type: error,
                            message: error?.data?.message
                        });
                    });
            },
            // 获取交付件
            getDeliverable({ row }) {
                if (!row.oid) return;
                this.loadings[row.oid] = true;
                this.$famHttp({
                    url: '/ppm/view/table/page',
                    method: 'post',
                    data: {
                        className: this.deliveryLink,
                        tableKey: 'DeliveryLinkView',
                        relationshipRef: row.oid,
                        queryId: '914898294'
                    }
                }).then((resp) => {
                    this.loadings[row.oid] = false;
                    let result = resp?.data?.records || [];
                    let deliverableTableData = [];
                    result.forEach((res) => {
                        let result = res.attrRawList.map((item) => {
                            item.attrName = item.attrName.split('#')[1];
                            return item;
                        });
                        let obj = ErdcKit.deserializeAttr(result, {
                            valueMap: {
                                'mainContent': (e) => {
                                    return e;
                                },
                                'securityLabel': (e) => {
                                    return e.displayName;
                                },
                                'lifecycleStatus.status': (e) => {
                                    return e.displayName;
                                },
                                'roleBObjectRef': (e) => {
                                    return e.oid;
                                },
                                'roleAObjectRef': (e) => {
                                    return e.oid;
                                }
                            }
                        });
                        obj.relationOid = res.relationOid;
                        obj.versionOid = res.versionOid;
                        obj.linkOid = res.oid;
                        obj.attrRawList = res.attrRawList;
                        deliverableTableData.push(obj);
                    });
                    this.$set(row, 'deliverableTableData', deliverableTableData);
                });
            },
            getTypeDisplayName(value) {
                let typeData = TreeUtil.getNode(this.deliveryTypeOptions, {
                    target: (node) => {
                        return node.value === value;
                    }
                });

                return typeData?.displayName || value;
            },
            // 交付件流程
            startProcess() {
                let selectData = ErdcKit.deepClone(this.$refs.deliverList.$refs.FamAdvancedTable.selectData);
                if (!selectData.length) {
                    return this.$message.info(this.i18n.pleaseSelectData); // 请先勾选数据
                }
                const deliverableTableDataArr = [];
                // 过滤掉没有交付件的数据
                selectData = selectData.filter((item) => item.deliverableTableData?.length);
                selectData.forEach((item) => {
                    const deliverableTableData = item.deliverableTableData.filter((item) => {
                        const status = item.attrRawList.find(
                            (item) => item.attrName === 'lifecycleStatus.status'
                        )?.value;
                        return status === 'INWORK';
                    });
                    deliverableTableDataArr.push(...deliverableTableData);
                    item.deliverableTableData = deliverableTableData;
                });
                if (!deliverableTableDataArr.length) {
                    return this.$message.info(this.i18n.pleaseUploadDeliverable); // 请至少上传一个交付件
                }
                let businessData = selectData.map((item) => {
                    item.planOid = this.poid;
                    item.businessSource = 'deliverables';
                    item.projectOid = this.$route.query.pid;
                    return item;
                });
                const afterRequest = (data) => {
                    if (data.length) this.$emit('close-dialog');
                };
                let containerRef = utils.getContainerRef();
                const oids = deliverableTableDataArr.map((item) => item.oid);
                const customGetProcessFunc = () => {
                    return this.$famHttp({
                        method: 'POST',
                        url: '/ppm/communal/getProcessDefDtoForOtherObj',
                        data: oids
                    });
                };
                actions.startProcess(this, {
                    businessData,
                    containerRef,
                    afterRequest,
                    customGetProcessFunc
                });
            },
            // （外部组件调用）页面大小变化后，重新调整表格宽度自适应
            resizeTableColumns() {
                this.$nextTick(() => {
                    this.$refs?.['deliverList']?.getTableInstance('baseTable')?.instance?.setVxeColumn();
                });
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            AddDeliverables: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/DeliveryDetails/component/AddDeliverables/index.js')
            ),
            DeliveryTable: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/DeliveryDetails/component/DeliveryTable/index.js')
            ),
            UploadTable: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/DeliveryDetails/component/UploadDeliverables/index.js')
            ),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            Dict: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDict/index.js'))
        }
    };
    return listComponent;
});
