define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageBasicInfo/template.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageBasicInfo/style.css'),
    'erdc-kit',
    'EventBus',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        props: {
            oid: {
                type: String,
                default: ''
            },
            hasModify: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageBasicInfo/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    moreActions: this.getI18nByKey('更多操作'),
                    editServer: this.getI18nByKey('编辑服务'),
                    editType: this.getI18nByKey('编辑类型'),
                    basicInformation: this.getI18nByKey('基本信息'),
                    setIcon: this.getI18nByKey('设置图标'),
                    setRule: this.getI18nByKey('设置规则'),
                    constantRule: this.getI18nByKey('常数规则'),
                    icon: this.getI18nByKey('图标'),
                    add: this.getI18nByKey('增加'),
                    remove: this.getI18nByKey('删除'),
                    save: this.getI18nByKey('保存'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    operation: this.getI18nByKey('操作'),
                    internalName: this.getI18nByKey('内部名称'),
                    showName: this.getI18nByKey('显示名称'),
                    more: this.getI18nByKey('更多'),
                    moveUp: this.getI18nByKey('上移'),
                    moveDown: this.getI18nByKey('下移'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    confirmRemoveData: this.getI18nByKey('是否要删除当前数据'),
                    confirmRemove: this.getI18nByKey('确认删除'),
                    removeSuccessfully: this.getI18nByKey('删除成功'),
                    removeFailure: this.getI18nByKey('删除失败'),
                    order: this.getI18nByKey('序号'),
                    iconRules: this.getI18nByKey('图标规则')
                },
                list: [
                    {
                        key: 'link1',
                        name: '操作' + 1
                    },
                    {
                        key: 'link2',
                        name: '操作' + 2
                    },
                    {
                        key: 'link3',
                        name: '操作' + 3
                    }
                ],
                listData: [],
                appName: 'plat',
                showIconRulesModule: false,
                basicUnfold: true,
                relationUnfold: true,
                attrName: '',
                dialogVisible: false,
                dialogIconVisible: false,
                openType: 'edit',
                dynamicConfig: [],
                rowData: {}, // 编辑行的规则列表
                formData: {
                    name: '', // 内部名称
                    displayName: {
                        // 显示名称
                        attr: 'nameI18nJson',
                        attrName: '显示名称',
                        value: {
                            value: '显示名称的主文本',
                            zh_cn: 'zh_cn',
                            zh_tw: 'zh_tw',
                            en_gb: 'en_gb',
                            en_us: 'en_us'
                        }
                    },
                    icon: 'erd-iconfont erd-icon-locked-activity', // 图标
                    description: {
                        // 说明
                        attr: 'nameI18nJson',
                        attrName: '说明',
                        value: {
                            value: '说明主文本',
                            zh_cn: 'zh_cn',
                            zh_tw: 'zh_tw',
                            en_gb: 'en_gb',
                            en_us: 'en_us'
                        }
                    },
                    lifecycleTemplateName: '', // 生命周期管理
                    codeDefCode: '', // 编号规则
                    teamTemplateName: '', // 团队模板
                    defaultFolderName: '', // 默认文件夹
                    enableCategoryManagement: '1', // 启用分类管理
                    subtypeable: '1', // 可有子类型
                    instantiable: '1', // 可实例化
                    changeMgmtCanceledStates: '', // 取消状态
                    changeMgmtCompletedStates: '' // 完成状态
                }
            };
        },
        components: {
            TypeManageConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageConfig/index.js')), // 编辑子类型
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            TypeSetIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeSetIcon/index.js')), // 编辑子类型
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        computed: {
            formConfig() {
                let defaultConfig = [
                    {
                        field: 'typeName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'internalName',
                        disabled: true,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    }
                ];
                return [...defaultConfig, ...this.dynamicConfig];
            },
            formDataConfig() {
                _.each(this.formConfig, (item) => {
                    item.required = false;
                });
                return this.formConfig;
            },
            formDataObj() {
                return this.formData;
            },
            columns() {
                return [
                    {
                        // title: this.i18nMappingObj?.['order'],
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'icon',
                        // title: this.i18nMappingObj?.['icon'],
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'ruleConditionName',
                        title: this.i18nMappingObj?.['setRule']
                    },
                    {
                        prop: 'oper',
                        title: this.i18nMappingObj?.['operation'],
                        width: 144,
                        sort: false,
                        fixed: 'right'
                    }
                ];
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.getRelationData(val);
                        this.fetchTypeDefById(val);
                    }
                }
            }
        },
        methods: {
            fetchTypeDefById(oid = null) {
                oid = typeof oid === 'object' ? oid.oid : oid;
                this.$famHttp({
                    url: '/fam/type/typeDefinition/getTypeDefById',
                    data: { oid },
                    method: 'get'
                }).then(({ data }) => {
                    let {
                        oid,
                        idKey,
                        propertyMap,
                        innerName,
                        number,
                        displayName,
                        nameI18nJson,
                        typeName,
                        serviceInfoRef,
                        tableName,
                        appName
                    } = data;
                    this.typeOid = oid;
                    this.className = idKey;
                    this.appName = appName || 'plat';
                    this.showIconRulesModule = !!_.isEmpty(propertyMap);
                    this.dynamicConfig = [];
                    let obj = {};
                    this.formData['name'] = number || innerName || displayName;
                    this.formData['typeName'] = typeName || number || innerName || displayName;
                    this.$emit('set-app-name', data.appName);
                    if (idKey === 'erd.cloud.foundation.tenant.entity.ServiceInfo') {
                        this.activeTab = {
                            name: 'basicInformation',
                            detail: 'TypeManageBasicInfo'
                        };
                        _.each(this.tabList, (item, index) => {
                            if (index !== 0) {
                                item['hidden'] = false;
                            }
                        });
                        obj = {
                            field: 'displayName',
                            component: 'FamI18nbasics',
                            label: this.i18nMappingObj['showName'],
                            labelLangKey: 'showName',
                            disabled: false,
                            validators: [],
                            props: {
                                clearable: true,
                                placeholder: this.i18nMappingObj['pleaseEnter'],
                                placeholderLangKey: 'pleaseEnter',
                                type: 'basics',
                                i18nName: this.i18nMappingObj['showName']
                            },
                            col: 12
                        };
                        this.dynamicConfig.push(obj);
                        this.formData['displayName'] = {
                            attr: 'nameI18nJson',
                            attrName: displayName,
                            value: nameI18nJson || {}
                        };
                    } else {
                        _.each(this.tabList, (item) => {
                            item['hidden'] = true;
                        });
                        let objs = [
                            {
                                field: 'serviceInfoRef',
                                component: 'custom-select',
                                label: '服务',
                                disabled: false,
                                readonly: true,
                                validators: [],
                                props: {
                                    row: {
                                        componentName: 'virtual-select',
                                        requestConfig: {
                                            url: 'platform/service/list',
                                            viewProperty: 'displayName',
                                            valueProperty: 'oid'
                                        }
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'tableName',
                                component: 'erd-input',
                                label: '表名',
                                hidden: !tableName,
                                readonly: true,
                                validators: [],
                                col: 12
                            }
                        ];
                        this.dynamicConfig = [...this.dynamicConfig, ...objs];
                        this.formData['serviceInfoRef'] = serviceInfoRef;
                        this.formData['tableName'] = tableName;
                        if (propertyMap) {
                            Object.values(propertyMap).forEach((val) => {
                                let componentAttr = val.constraintDefinitionDto || {};
                                let renderValue = val.propertyValue;
                                // 组件配置
                                let compName = componentAttr.componentName;
                                let componentConf = this.fnComponentHandle(compName, true);
                                if (val.name == 'description' || val.name == 'displayName') {
                                    obj = {
                                        field: val.name,
                                        component: 'FamI18nbasics',
                                        label: val.displayName,
                                        labelLangKey: val.displayName,
                                        disabled: true,
                                        hidden: componentAttr.isHidden || false,
                                        required: false,
                                        validators: [],
                                        props: {
                                            clearable: true,
                                            placeholder: this.i18nMappingObj['pleaseEnter'],
                                            placeholderLangKey: 'pleaseEnter',
                                            type: val.name == 'description' ? 'textarea' : 'basics',
                                            i18nName: val.displayName
                                        },
                                        col: 12
                                    };
                                    this.formData[val.name] = {
                                        attr: 'nameI18nJson',
                                        attrName: val.name,
                                        value: renderValue.languageJson || {}
                                    };
                                } else if (val.name === 'icon') {
                                    obj = {
                                        field: 'icon',
                                        component: 'FamIconSelect',
                                        label: this.i18nMappingObj['icon'],
                                        type: 'icon',
                                        labelLangKey: 'icon',
                                        disabled: false,
                                        required: false,
                                        validators: [],
                                        hidden: false,
                                        props: {
                                            visibleBtn: true,
                                            btnName: '选择图标'
                                        },
                                        slots: {
                                            readonly: 'iconReadonly'
                                        },
                                        col: 12
                                    };

                                    this.isIcon = this.formData[val.name] =
                                        renderValue.value || 'erd-iconfont erd-icon-triangle-left';
                                } else {
                                    let enumData = new FormData();
                                    enumData.append('realType', componentAttr?.dataKey);
                                    // 判断如果下拉框请求配置为空，则赋值默认的请求参数
                                    const config = this.getConfigTemp(
                                        componentAttr,
                                        enumData,
                                        componentConf.componentConfigs
                                    );

                                    // 生命周期模板, valueProperty修改为 vid
                                    if (val.name === 'lifecycleTemplateName') {
                                        config.valueProperty = 'key';
                                        config.data.appName = this.appName;
                                    }

                                    // 编码规则, 修改header
                                    if (val.name === 'codeDefCode') {
                                        config.data.appName = this.appName;
                                    }
                                    obj = {
                                        field: val.name,
                                        component: componentConf.showComponent,
                                        label: val.displayName,
                                        labelLangKey: val.displayName,
                                        disabled: true,
                                        hidden: componentAttr.isHidden || false,
                                        required: false,
                                        validators: [],
                                        props: {
                                            clearable: true,
                                            placeholder: '请输入',
                                            placeholderLangKey: '请输入',
                                            row: {
                                                componentName: compName, // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                                                requestConfig: config,
                                                // requestConfig: {
                                                //     // 特殊处理下拉框
                                                //     ...componentConf.componentConfigs,
                                                //     data: enumData,
                                                //     viewProperty: 'value',
                                                //     valueProperty: 'name'
                                                // },
                                                clearNoData: true // value未匹配到option中数据时，清除数据项
                                            }
                                        },
                                        col: 12
                                    };

                                    if (val.name === 'classifyRef') {
                                        obj.props = this.getClassifyRefConfig(obj, compName);

                                        // 处理堆栈溢出问题
                                        this.$set(this.formData, val.name, { oid: renderValue.value || '' });
                                    }
                                    this.formData[val.name] = renderValue.i18nValue || renderValue.value;

                                    if (componentAttr.componentName == 'FamBoolean') {
                                        obj['component'] = 'erd-radio';
                                        obj['slots'] = {
                                            component: 'radioComponent'
                                        };
                                        obj['readonlyComponent'] = 'FamBooleanStaticText';
                                        this.formData[val.name] =
                                            renderValue.i18nValue || renderValue.value
                                                ? JSON.parse(renderValue.i18nValue || renderValue.value)
                                                : '';
                                    }
                                }
                                this.dynamicConfig.push(obj);
                            });
                        }
                    }
                    if (innerName || displayName) {
                        this.moduleTitle = displayName || innerName;
                    }
                });
            },
            getConfigTemp(attr, enumData, originConfig) {
                let baseConfig = {};
                let baseMap = {
                    viewProperty: 'name',
                    valueProperty: 'value'
                };
                const isEmptyConfig = _.isEmpty(originConfig);
                if (isEmptyConfig) {
                    baseConfig = {
                        url: '/fam/listByKey',
                        data: {
                            className: attr.dataKey
                        },
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    };
                } else {
                    baseConfig = {
                        ...originConfig,
                        data: enumData,
                        ...baseMap
                    };
                }
                return baseConfig;
            },
            // 获取关联列表
            getRelationData(oid) {
                const data = { typeReference: oid };
                this.$famHttp({
                    url: '/fam/type/typeDefinition/find/constant',
                    data,
                    method: 'get'
                }).then((resp) => {
                    // this.listData = resp?.data?.records || []
                    const { records } = resp?.data || [];
                    if (resp.data) {
                        this.listData = records.map((item) => {
                            let arr = [];
                            _.each(item.conditionDtoList, (item1) => {
                                arr.push(item1.displayString);
                            });
                            this.$set(item, 'conditionList', arr);
                            return item;
                        });
                    }
                });
            },
            // 编辑后刷新数据
            onSubmit(oid) {
                if (oid) {
                    this.$emit('submit', oid);
                    this.fetchTypeDefById({
                        oid
                    });
                }
            },
            // 更新常数规则列表
            updateConstants() {
                this.getRelationData(this.oid);
            },
            onEdit() {
                this.openType = 'edit';
                if (this.formDataConfig.length === 2) {
                    this.attrName = this.i18nMappingObj.editServer;
                } else {
                    this.attrName = this.i18nMappingObj.editType;
                }
                this.dialogVisible = true;
            },
            // 图标规则
            onAddIcon() {
                this.openType = 'create';
                this.dialogIconVisible = true;
                this.rowData = {};
            },
            onEditRule(data) {
                this.openType = 'edit';
                this.dialogIconVisible = true;
                this.rowData = data.row;
            },
            onDeleteRule(data) {
                this.$confirm(this.i18nMappingObj?.['confirmRemoveData'], this.i18nMappingObj?.['confirmRemove'], {
                    confirmButtonText: this.i18nMappingObj?.['confirm'],
                    cancelButtonText: this.i18nMappingObj?.['cancel'],
                    type: 'warning'
                }).then(() => {
                    const param = {
                        oid: data.row.oid
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            message: this.i18nMappingObj?.['removeSuccessfully'],
                            type: 'success',
                            showClose: true
                        });
                        this.getRelationData(this.oid);
                    });
                });
            },
            onMoveUp(data) {
                const { row } = data;
                let Index = 0;
                let currentRow = {};
                try {
                    this.listData.forEach((item, index) => {
                        if (item.oid == row.oid) {
                            if (index <= 0) {
                                throw Error();
                            } else {
                                currentRow = this.listData.splice(index, 1)[0];
                                Index = index;
                            }
                        }
                    });
                } catch (error) {
                    this.$message({
                        type: 'warning',
                        message: '当前位置不可上移',
                        showclose: true
                    });
                    return;
                }

                this.listData.splice(Index - 1, 0, currentRow);
                const oids = this.listData.map((item) => item.oid);
                this.sortBy(oids, 'UP');
            },
            onMoveDown(data) {
                const { row } = data;
                let Index = 0;
                let currentRow = {};
                let Length = this.listData.length;
                try {
                    this.listData.forEach((item, index) => {
                        if (item.oid == row.oid) {
                            if (index < Length - 1 && !this.listData[index + 1]?.isExtends) {
                                currentRow = this.listData.splice(index, 1)[0];
                                Index = index;
                            } else {
                                throw Error;
                            }
                        }
                    });
                } catch (error) {
                    this.$message({
                        type: 'warning',
                        message: '当前位置不可下移',
                        showclose: true
                    });
                    return;
                }

                this.listData.splice(Index + 1, 0, currentRow);
                const oids = this.listData.map((item) => item.oid);
                this.sortBy(oids, 'DOWN');
            },
            // 排序请求
            sortBy(data, optType) {
                // 请求接口
                this.$famHttp({
                    url: `/fam/sort`,
                    method: 'POST',
                    data
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: optType == 'UP' ? '上移成功' : '下移成功',
                            showClose: true
                        });
                    })
                    .finally(() => {
                        this.getRelationData(this.oid);
                    });
            },
            // 设置规则显示内容
            conditionListName(data) {
                let conditionListName = '';
                data.forEach((item, index) => {
                    conditionListName += `<span style="border-radius: 2px;padding: 0 4px;background: #ECECEC;">${item}</span>`;
                    if (index !== data.length - 1) {
                        conditionListName += `&nbsp;<span v-if="index !== data.row.conditionList.length - 1">AND</span>&nbsp;</span>`;
                    }
                });

                return conditionListName;
            },
            // 获取分类的配置项
            getClassifyRefConfig(obj, compName) {
                return {
                    ...obj.props,
                    filterable: true,
                    treeSelect: true,
                    treeProps: {
                        label: 'displayName',
                        children: 'children',
                        value: 'oid'
                    },
                    row: {
                        componentName: ErdcKit.hyphenate(compName),
                        requestConfig: {
                            url: '/fam/classify/tree',
                            viewProperty: 'displayName',
                            valueProperty: 'oid'
                        }
                    }
                };
            }
        }
    };
});
