define([
    'erdcloud.kit',
    'TreeUtil',
    'erdc-kit',
    'text!' + ELMP.resource('system-preference/views/PreferenceManage/index.html'),
    'vue',
    'fam:kit',
    'css!' + ELMP.resource('system-preference/views/PreferenceManage/style.css')
], function (ErdcKit, TreeUtil, utils, template) {
    return {
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            // 配置组|项
            PreferenceForm: ErdcKit.asyncComponent(
                ELMP.resource('system-preference/components/PreferenceForm/index.js')
            ),
            // 配置值
            PreferenceValueForm: ErdcKit.asyncComponent(
                ELMP.resource('system-preference/components/PreferenceValueForm/index.js')
            ),
            FamInfoTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-preference/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    pleaseEnter: this.getI18nByKey('pleaseEnter'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    confirmDeleteData: this.getI18nByKey('confirmDeleteData'),
                    editSuccess: this.getI18nByKey('editSuccess'),
                    createSuccess: this.getI18nByKey('createSuccess'),
                    editFailure: this.getI18nByKey('editFailure'),
                    createFailure: this.getI18nByKey('createFailure'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    configurationItem: this.getI18nByKey('configurationItem'),
                    createConfigurationGroup: this.getI18nByKey('createConfigurationGroup'),
                    editConfigurationGroup: this.getI18nByKey('editConfigurationGroup'),
                    name: this.getI18nByKey('name'),
                    number: this.getI18nByKey('number'),
                    configType: this.getI18nByKey('configType'),
                    realType: this.getI18nByKey('realType'),
                    status: this.getI18nByKey('status'),
                    appName: this.getI18nByKey('appName'),
                    locked: this.getI18nByKey('locked'),
                    description: this.getI18nByKey('description'),
                    operation: this.getI18nByKey('operation'),
                    edit: this.getI18nByKey('edit'),
                    delete: this.getI18nByKey('delete'),
                    more: this.getI18nByKey('more'),
                    draft: this.getI18nByKey('draft'),
                    enable: this.getI18nByKey('enable'),
                    disable: this.getI18nByKey('disable'),
                    createLevelConfigurationGroup: this.getI18nByKey('createLevelConfigurationGroup'),
                    createConfigurationSet: this.getI18nByKey('createConfigurationSet'),
                    createConfigurationItem: this.getI18nByKey('createConfigurationItem'),
                    editConfigurationItem: this.getI18nByKey('editConfigurationItem'),
                    configurationValue: this.getI18nByKey('configurationValue'),
                    giveUpEdit: this.getI18nByKey('giveUpEdit'),
                    confirmCancel: this.getI18nByKey('confirmCancel')
                },
                loading: false,
                formLoading: false,
                searchVal: '',
                tableData: [],
                defaultTableDta: [],
                visibleGroup: false, // 配置组
                visibleItem: false, // 配置项
                visibleValue: false, // 配置值
                oid: '', // 配置项|组 oid
                preferencesRefOid: '', // 配置值oid
                containerRef: '', // 上下文oid
                appName: '',
                groupType: 'create', // 配置组的类型，默认创建
                configType: 'GROUP', // 当前类型
                locked: '0', // 是否锁定
                formData: {}, // 配置项|组表单信息
                preferenceValueFormData: {}, // 配置值的表单信息
                preferenceListData: {}, // 列表中配置值的数据
                defaultConfigFile: [], // 默认的配置项附件id
                delConfigFile: [], // 删除的配置项附件id
                isChanged: false,
                defaultFormData: {}, // 默认表单数据, 用来判断是否有改变了数据类型 组件类型 值选项
                famAdvancedTable: null,
                title: '',
                _this: null,
                preferenceVisible: false,
                preferenceFormData: {
                    configs: []
                },
                preferenceData: [],
                preferenceLoading: false,
                preferenceConfigs: [],
                isActivate: false
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            viewTableTitle() {
                return this.i18n.preference;
            },
            containerOid() {
                if (this.$route.path.includes('sys/preference')) {
                    return '';
                }
                return this.$store.state.space?.context?.oid || '';
            },
            readonly() {
                return false;
            },
            // title() {
            //     return this.configType === 'GROUP'
            //         ? this.groupType === 'create'
            //             ? this.i18nMappingObj['createConfigurationGroup']
            //             : this.i18nMappingObj['editConfigurationGroup']
            //         : this.i18nMappingObj['configurationItem'];
            // },
            rightBtnList() {},
            viewTableConfig() {
                let tableConfig = {
                    vm: this,
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/peferences/tree/list', // 表格数据接口
                        params: {
                            containerOid: this.containerOid
                        }, // 路径参数
                        method: 'get', // 请求方法（默认get）
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    const { data, dataType } = resData?.data || {};
                                    resData.data.records = this.eachTreeTable(data, dataType);
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    columnWidths: {
                        operation: this.language === 'zh_cn' ? 60 : 92
                    },
                    tableRequestDataConfig: 'data', // 获取表格接口请求回来数据的字段名称
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        method: 'POST',
                        data: { className: this.$store.getters.className('preferences') }
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: '请输入名称', // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '320',
                            isLocalSearch: true,
                            searchCondition: ['displayName']
                        }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true, // 溢出隐藏显示省略号
                        treeNode: 'nameI18nJson',
                        treeConfig: {
                            children: 'children',
                            expandAll: false
                        }
                    },
                    addSeq: true,
                    addOperationCol: true,
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default' // 显示字段内容插槽
                        },
                        {
                            prop: 'nameI18nJson',
                            type: 'default'
                        },
                        {
                            prop: 'locked',
                            type: 'default'
                        },
                        {
                            prop: 'status',
                            type: 'default'
                        },
                        {
                            prop: 'realType',
                            type: 'default'
                        },
                        {
                            prop: 'descriptionI18nJson',
                            type: 'default'
                        },
                        {
                            prop: 'appName',
                            type: 'default'
                        }
                    ],
                    pagination: {
                        showPagination: false
                    }
                };
                tableConfig.toolbarConfig = _.extend(
                    tableConfig.toolbarConfig,
                    this.containerOid
                        ? {
                              actionConfig: {
                                  name: 'PREFERNCES_CONTEXT_ADD'
                              }
                          }
                        : {
                              actionConfig: {
                                  name: 'PREFERNCES_CREATE'
                              }
                          }
                );
                return tableConfig;
            },
            preferenceFormConfig() {
                const _this = this;
                return [
                    {
                        field: 'configs',
                        component: 'erd-tree-select',
                        label: '系统配置项',
                        required: false,
                        validators: [],
                        props: {
                            props: {
                                children: 'childList',
                                label: 'displayName',
                                value: 'oid'
                            },
                            defaultExpandAll: true,
                            nodeKey: 'oid',
                            multiple: true,
                            data: _this.preferenceData
                        },
                        slots: {
                            component: 'configsComponent'
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            this._this = this;
        },
        methods: {
            getPreferenceData(containerOid) {
                this.$famHttp({
                    url: `/fam/peferences/tree/${containerOid}`
                }).then((resp) => {
                    const { data } = resp;
                    this.preferenceData = data || [];
                });
            },
            eachTreeTable(data, dataType) {
                data.forEach((item) => {
                    item.realTypeDisplayName = item.realType || '';
                    const newData = dataType.find((value) => item.realType === value.name) || {};
                    item.realTypeDisplayName = newData.displayName || item.realType;
                    if (item.children && item.children.length) {
                        this.eachTreeTable(item.children, dataType);
                    }
                });
                return data;
            },
            // 刷新表格
            reloadTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            getActionConfig(row) {
                if (this.containerOid) {
                    return {
                        name: 'PREFERNCES_CONTEXT_MORE',
                        objectOid: row.oid
                    };
                }
                if (row.configType === 'GROUP') {
                    return {
                        name: 'PREFERNCES_GROUP_MORE',
                        objectOid: row.oid
                    };
                }
                return {
                    name: 'PREFERNCES_ITEM_MORE',
                    objectOid: row.oid
                };
            },
            actionClick(type, data) {
                switch (type.name) {
                    case 'PREFERNCES_CREATE_GROUP':
                        this.groupForm({}, 'create', 'GROUP');
                        break;

                    case 'PREFERNCES_ADD_CONTEXT':
                        this.addPreferenceConfig();
                        break;
                    default:
                        break;
                }
            },
            onCommand(type, data, methodName) {
                // 切换成为全局注册,此方法可以去除
                return;
                // const eventClick = {
                //     PREFERNCES_CREATE_SUBGROUP: this.createGrouup,
                //     PREFERNCES_CREATE_ITEM: this.createItem,
                //     PREFERNCES_EDIT: this.edit,
                //     PREFERNCES_DELETE: this.delete,
                //     PREFERNCES_EDIT_VALUE: this.editValue
                // };
                // eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            createGrouup(data) {
                return this.groupForm(data, 'create', 'GROUP');
            },
            createItem(data) {
                return this.groupForm(data, 'create', 'ITEM');
            },
            edit(data) {
                return this.onEdit(data);
            },
            delete(data) {
                return this.onDelete(data);
            },
            editValue(data) {
                return this.onEditValue(data);
            },
            /**
             * 配置组表单
             */
            groupForm(data, type, configType) {
                this.configType = configType;
                this.visibleGroup = true;
                this.containerRef = data?.containerRef || '';
                this.groupType = type || 'create';
                this.appName = data?.appName || '';
                this.title =
                    configType === 'GROUP'
                        ? type === 'create'
                            ? this.i18nMappingObj['createConfigurationGroup']
                            : this.i18nMappingObj['editConfigurationGroup']
                        : type === 'create'
                          ? this.i18nMappingObj['createConfigurationItem']
                          : this.i18nMappingObj['editConfigurationItem'];
                if (data?.oid) {
                    this.oid = data.oid || ''; // 如果创建子配置项时作为父oid
                    this.locked = data.locked ? '1' : '0';
                    this.formData = {
                        appName: this.appName || '',
                        status: '0',
                        locked: true,
                        componentRef: '',
                        dataKey: '',
                        // 配置项上传文件的id
                        configFileIds: data?.configFile?.map((item) => item.roleBObjectRef.split(':')[2]) || [],
                        // 附件的详情
                        configFile: data?.configFile || []
                    };
                    // 默认的配置项文件(用来判断是否有新增和删除)
                    this.defaultConfigFile = JSON.parse(JSON.stringify(data?.configFile || []));
                    // 删除的文件详情
                    this.delConfigFile = [];
                    if (this.groupType === 'update') {
                        this.fetchFormData();
                    }

                    if (data?.preferencesConfigDtoList?.length) {
                        const oid = data.preferencesConfigDtoList[0].oid;
                        this.preferencesRefOid = oid;
                    }
                }
            },
            /**
             * 配置项|组保存
             */
            formSubmit() {
                // 调用表单数据，调用接口
                this.$refs.preferenceForm.submit().then((data) => {
                    // 通过类型判断是配置组还是配置项，去调用对应的接口
                    this.formLoading = true;
                    // 配置组
                    if (this.configType === 'GROUP') {
                        const appName = data.find((item) => item.attrName === 'appName').value;

                        let attrRawList = [
                            ...[
                                {
                                    attrName: 'configType',
                                    value: 'GROUP'
                                },
                                {
                                    attrName: 'locked',
                                    value: this.locked ? '1' : '0'
                                }
                            ],
                            ...data
                        ];
                        if (this.groupType === 'create' && this.oid) {
                            attrRawList.push({
                                attrName: 'parentRef',
                                value: this.oid
                            });
                        }
                        const formData = {
                            className: 'erd.cloud.foundation.core.preferences.entity.Preferences',
                            appName,
                            attrRawList,
                            oid: this.oid || ''
                        };

                        let url = '/fam/create';
                        if (this.groupType === 'update') {
                            url = '/fam/update';
                        }
                        this.$famHttp({
                            url,
                            method: 'POST',
                            data: formData
                        })
                            .then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message:
                                        this.groupType === 'update'
                                            ? this.i18nMappingObj['editSuccess']
                                            : this.i18nMappingObj['createSuccess'],
                                    shouClose: true
                                });
                                this.closeForm(false);
                                this.reloadTable();
                            })
                            .catch((error) => {
                                console.error(error);
                            })
                            .finally(() => {
                                this.formLoading = false;
                            });
                    } else {
                        const appName = data.find((item) => item.attrName === 'appName').value;
                        let attrRawList = [
                            {
                                attrName: 'configType',
                                value: 'ITEM'
                            },
                            {
                                attrName: 'locked',
                                value: this.locked ? '1' : '0'
                            },
                            ...data.filter((item) => item.attrName !== 'configFileIds')
                        ];

                        const configFileIds = data.find((item) => item.attrName === 'configFileIds')?.value || [];
                        let relationList = [];
                        if (configFileIds && configFileIds.length) {
                            const addConfigFileIds = [];
                            configFileIds.forEach((item) => {
                                if (
                                    !this.defaultConfigFile
                                        .map((item) => item.roleBObjectRef.split(':')[2])
                                        .includes(item)
                                ) {
                                    addConfigFileIds.push(item);
                                }
                            });

                            if (this.delConfigFile.length || addConfigFileIds.length) {
                                _.union(
                                    configFileIds,
                                    this.delConfigFile.map((item) => item.roleBObjectRef.split(':')[2])
                                ).forEach((FileId) => {
                                    let action = '';
                                    if (addConfigFileIds.includes(FileId)) {
                                        action = 'CREATE';
                                    }

                                    let delOid = '';
                                    this.delConfigFile.forEach((item) => {
                                        if (item.roleBObjectRef.split(':')[2] === FileId) {
                                            action = 'DELETE';
                                            delOid = item.oid;
                                        }
                                    });
                                    let preferencesFileObj = {
                                        action,
                                        oid: delOid,
                                        className: 'erd.cloud.foundation.core.preferences.entity.PreferencesFile',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: 'OR:erd.cloud.doc.domain.entity.FileData:' + FileId
                                            }
                                        ]
                                    };
                                    let preferencesConfigObj = {
                                        action,
                                        oid: delOid,
                                        className: 'erd.cloud.foundation.core.preferences.entity.PreferencesConfig',
                                        relationField: 'preferencesRef',
                                        attrRawList: [
                                            {
                                                attrName: 'configValue',
                                                value: '{}'
                                            }
                                        ]
                                    };
                                    if (action) {
                                        relationList.push(preferencesFileObj);
                                        relationList.push(preferencesConfigObj);
                                    }
                                });
                            }
                        }
                        if (this.groupType === 'create' && this.oid) {
                            attrRawList.push({
                                attrName: 'parentRef',
                                value: this.oid
                            });
                        }
                        const formData = {
                            className: 'erd.cloud.foundation.core.preferences.entity.Preferences',
                            associationField: 'roleAObjectRef',
                            appName,
                            attrRawList,
                            relationList,
                            oid: this.oid || ''
                        };

                        let url = '/fam/create';
                        if (this.groupType === 'update') {
                            url = '/fam/update';
                        }
                        this.$famHttp({
                            url,
                            method: 'POST',
                            data: formData
                        })
                            .then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message:
                                        this.groupType === 'update'
                                            ? this.i18nMappingObj['editSuccess']
                                            : this.i18nMappingObj['createSuccess'],
                                    shouClose: true
                                });

                                // 调用删除配置值接口, 清空配置值
                                let isDeleteValue =
                                    this.formData.componentRef !== this.defaultFormData.componentRef ||
                                    this.formData.realType !== this.defaultFormData.realType ||
                                    this.formData.dataKey !== this.defaultFormData.dataKey;

                                let isConfigFileIdChange = false;
                                if (
                                    this.defaultFormData?.configFileIds?.length === this.formData?.configFileIds?.length
                                ) {
                                    this.formData.configFileIds.forEach((item) => {
                                        if (!this.defaultFormData.configFileIds.includes(item)) {
                                            isConfigFileIdChange = true;
                                        }
                                    });
                                } else {
                                    isConfigFileIdChange = true;
                                }
                                if (this.preferencesRefOid && (isDeleteValue || isConfigFileIdChange)) {
                                    this.deleteFormValue(this.preferencesRefOid, () => {
                                        this.closeForm(false);
                                        this.reloadTable();
                                    });
                                } else {
                                    this.closeForm(false);
                                    this.reloadTable();
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                            })
                            .finally(() => {
                                this.formLoading = false;
                            });
                    }
                });
            },
            /**
             * 编辑配置组/项
             * @param {*} data
             */
            onEdit(data) {
                if (data.configType === 'GROUP') {
                    this.groupForm(data, 'update', 'GROUP');
                } else {
                    this.groupForm(data, 'update', 'ITEM');
                }
            },
            /**
             * 配置值保存
             */
            formValueSubmit() {
                const { preferenceValueForm } = this.$refs;
                preferenceValueForm.submit().then((data) => {
                    let attrDataCreate = {
                        className: 'erd.cloud.foundation.core.preferences.entity.PreferencesConfig',
                        appName: this.appName,
                        associationField: 'preferencesRef',
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'configValue',
                                value: this.preferenceListData.realType === 'object' ? JSON.stringify(data) : data
                            },
                            {
                                attrName: 'containerRef',
                                value: this.containerRef
                            },
                            {
                                attrName: 'preferencesRef',
                                value: this.oid
                            }
                        ]
                    };

                    let attrDataUpdate = {
                        oid: this.preferencesRefOid,
                        action: 'UPDATE',
                        className: 'erd.cloud.foundation.core.preferences.entity.PreferencesConfig',
                        attrRawList: [
                            {
                                attrName: 'configValue',
                                value: this.preferenceListData.realType === 'object' ? JSON.stringify(data) : data
                            }
                        ]
                    };
                    if (this.containerOid) {
                        attrDataCreate.containerOid = this.containerOid;
                        attrDataUpdate.containerOid = this.containerOid;
                    }
                    let url = '/fam/create';
                    if (this.preferencesRefOid) {
                        url = '/fam/update';
                    }
                    // 请求接口保存数据
                    this.$famHttp({
                        url,
                        method: 'POST',
                        data: this.preferencesRefOid ? attrDataUpdate : attrDataCreate
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.preferencesRefOid
                                    ? this.i18nMappingObj['editSuccess']
                                    : this.i18nMappingObj['createSuccess'],
                                showClose: true
                            });
                            this.closeForm(false);
                            this.reloadTable();
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            },
            /**
             *
             */
            deleteFormValue(oid, cb) {
                this.$famHttp({
                    url: '/fam/delete',
                    params: {
                        oid
                    },
                    method: 'DELETE'
                })
                    .then((resp) => {
                        cb && cb();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            /**
             * 删除附件回调
             * @param {*} file 删除的文件的信息
             * @param {*} fileList 剩下文件信息列表
             */
            deleteFile(file, fileList) {
                this.defaultConfigFile.forEach((item) => {
                    if (file.id === item.roleBObjectRef.split(':')[2]) {
                        this.delConfigFile.push(item);
                    }
                });
            },
            /**
             * 关闭弹窗
             */
            closeForm(isTips) {
                // if (this.isChanged && this.oid && isTips) {
                //     this.$confirm(this.i18nMappingObj['giveUpEdit'], this.i18nMappingObj['confirmCancel'], {
                //         confirmButtonText: this.i18nMappingObj['confirm'],
                //         cancelButtonText: this.i18nMappingObj['cancel'],
                //         type: 'warning'
                //     })
                //         .then(() => {
                //             this.restoreinit();
                //         })
                //         .catch(() => {});
                // } else {
                //     this.restoreinit();
                // }
                this.restoreinit();
            },
            /**
             * 恢复初始化数据
             */
            restoreinit() {
                this.formData = {
                    appName: this.appName || '',
                    status: '0',
                    locked: true,
                    componentRef: '',
                    dataKey: ''
                };
                this.oid = '';
                this.configType = 'GROUP';
                this.appName = '';
                this.locked = '0';
                this.preferenceValueFormData = {};
                this.preferenceListData = {};
                this.preferencesRefOid = '';
                this.containerRef = '';
                this.delConfigFile = [];
                this.defaultConfigFile = [];

                this.visibleGroup = false;
                this.visibleValue = false;
                this.isChanged = false;
                this.isActivate = false;
            },
            /**
             * 获取配置项(组)表单详情接口
             */
            fetchFormData() {
                this.$famHttp({
                    url: '/fam/attr?oid=' + this.oid
                })
                    .then((resp) => {
                        const { rawData } = resp.data || {};
                        // this.formData = ErdcKit.deserializeAttr(rawData, {
                        //     valueKey: 'value'
                        // });
                        Object.keys(rawData).forEach((item) => {
                            let value = rawData[item].value;
                            if (item === 'componentRef') {
                                value = rawData[item].oid === 'null' || !rawData[item].oid ? '' : rawData[item].oid;
                            }
                            if (item.includes('I18nJson')) {
                                value = {
                                    attrName: item,
                                    value: rawData[item].value
                                };
                            }
                            if (item === 'status') {
                                value = value?.toString();
                                this.isActivate = value !== '0';
                            }
                            this.$set(this.formData, item, value);
                            this.defaultFormData = ErdcKit.deepClone(this.formData);
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            fetchValueFormData(oid, cb) {
                this.$famHttp({
                    url: '/fam/attr?oid=' + oid
                })
                    .then((resp) => {
                        const { rawData } = resp.data;

                        this.$set(this.preferenceValueFormData, 'data', ErdcKit.deserializeAttr(rawData || {}));
                        this.$set(this.preferenceValueFormData, 'type', 'update');
                        if (rawData.componentJson) {
                            this.$set(this.preferenceValueFormData, 'componentsJson', rawData.componentJson);
                        }
                        cb && cb();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            // 删除 系统管理
            onDelete(data) {
                const oid = data?.oid || '';
                const oidList = [oid];
                this.$confirm(this.i18nMappingObj['confirmDeleteData'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/deleteByIds',
                        method: 'DELETE',
                        params: {},
                        data: {
                            category: 'DELETE',
                            fieldList: [],
                            className: 'erd.cloud.foundation.core.preferences.entity.Preferences',
                            oidList,
                            containerOid: this.containerOid
                        }
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['deleteSuccess'],
                                showClose: true
                            });
                            this.reloadTable();
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || error,
                            //     showClose: true
                            // });
                        });
                });
            },
            /**
             * 删除 上下文
             */
            contextDelete(data) {
                const oid = data?.oid || '';
                const oidList = [oid];
                this.$confirm(this.i18nMappingObj['confirmDeleteData'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/peferences/PreferencesConfig/remove',
                        method: 'DELETE',
                        params: {
                            containerOid: this.containerOid
                        },
                        data: oidList
                    })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['deleteSuccess'],
                                showClose: true
                            });
                            this.reloadTable();
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: 'error',
                            //     message: error?.data?.message || error,
                            //     showClose: true
                            // });
                        });
                });
            },
            /**
             * 编辑值
             * @param {*} data
             */
            onEditValue(data) {
                this.oid = data?.oid || '';
                this.appName = data?.appName || '';
                this.containerRef = data?.containerRef || '';
                this.$set(this.preferenceValueFormData, 'displayName', data?.displayName || '');
                this.$set(this.preferenceValueFormData, 'type', 'create');
                this.$set(this.preferenceValueFormData, 'componentsJson', data.componentJson);
                this.preferenceListData = data;

                if (data?.preferencesConfigDtoList && data?.preferencesConfigDtoList?.length) {
                    const oid = data.preferencesConfigDtoList[0].oid;
                    this.preferencesRefOid = oid;
                    this.fetchValueFormData(oid, () => {
                        this.visibleValue = true;
                    });
                } else {
                    this.visibleValue = true;
                }
            },
            formChange(isChanged) {
                this.isChanged = isChanged;
            },
            searchValue(value) {
                utils.debounceFn(() => {
                    if (value) {
                        this.tableData = TreeUtil.filterTreeTable(
                            JSON.parse(JSON.stringify(this.defaultTableDta)),
                            value,
                            {
                                children: 'children',
                                attrs: ['displayName', 'displayDesc']
                            }
                        );
                    } else {
                        this.tableData = this.defaultTableDta;
                    }
                    const $table = this.$refs['erdTable']?.$refs.xTable;
                    setTimeout(() => {
                        $table?.setAllTreeExpand(true);
                        $table?.updateData();
                    }, 0);
                }, 500);
            },
            statusDisableName(data) {
                const nameMap = {
                    0: this.i18nMappingObj['draft'],
                    1: this.i18nMappingObj['enable'],
                    2: this.i18nMappingObj['disable']
                };
                return data.configType === 'GROUP' ? '' : nameMap[+data.status];
            },
            lockedDisplayName(data) {
                return data.configType === 'GROUP' ? '' : data.locked ? this.i18n.yes : this.i18n.no;
            },
            dynamicClass(data) {
                const classMap = {
                    bold: data.configType === 'GROUP'
                };
                return classMap;
            },
            addPreferenceConfig() {
                this.preferenceData = [];
                this.preferenceConfigs = [];
                this.preferenceFormData.configs = [];
                if (this.containerOid) {
                    this.getPreferenceData(this.containerOid);
                    this.preferenceVisible = true;
                }
            },
            addConfig() {
                const { preferenceForm } = this.$refs;
                preferenceForm.submit().then(({ valid }) => {
                    const preferenceFormData = this.preferenceFormData?.configs || [];
                    const flattenData = TreeUtil.flattenTree2Array(this.preferenceData, { childrenField: 'childList' });
                    const data = flattenData
                        .filter((item) => {
                            return item.category === 'ITEM' && preferenceFormData.includes(item.oid);
                        })
                        .map((item) => item.oid);
                    if (_.isEmpty(data)) {
                        return this.$message({
                            type: 'success',
                            message: '请选择配置项',
                            showClose: true
                        });
                    }
                    this.preferenceLoading = true;
                    this.$famHttp({
                        url: '/fam/peferences/PreferencesConfig/add',
                        method: 'post',
                        params: {
                            containerOid: this.containerOid
                        },
                        data
                    })
                        .then(() => {
                            this.$message({
                                type: 'success',
                                message: '添加配置项成功',
                                showClose: true
                            });
                            this.reloadTable();
                            this.preferenceVisible = false;
                        })
                        .finally(() => {
                            this.preferenceLoading = false;
                        });
                });
            }
        }
    };
});
