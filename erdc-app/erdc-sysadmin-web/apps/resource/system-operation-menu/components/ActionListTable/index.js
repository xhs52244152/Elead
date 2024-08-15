define([
    'text!' + ELMP.resource('system-operation-menu/components/ActionListTable/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-operation-menu/components/ActionListTable/style.css'),
    'underscore'
], function (template, utils) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            Checker: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/components/Checker/index.js')),
            GroovyFilter: ErdcKit.asyncComponent(
                ELMP.resource('system-operation-menu/components/GroovyFilter/index.js')
            )
        },
        props: {
            buttonInfo: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    application: this.getI18nByKey('application'),
                    nameI18nJson: this.getI18nByKey('nameI18nJson'),
                    businessName: this.getI18nByKey('businessName'),
                    name: this.getI18nByKey('name'),
                    oName: this.getI18nByKey('oName'),
                    appName: this.getI18nByKey('appName'),
                    typeName: this.getI18nByKey('typeName'),
                    icon: this.getI18nByKey('icon'),
                    sselectIcon: this.getI18nByKey('sselectIcon'),
                    IconTips: this.getI18nByKey('IconTips'),
                    enabled: this.getI18nByKey('enabled'),
                    descriptionI18nJson: this.getI18nByKey('descriptionI18nJson'),
                    increase: this.getI18nByKey('increase'),
                    newIncrease: this.getI18nByKey('newIncrease'),
                    add: this.getI18nByKey('add'),
                    edit: this.getI18nByKey('edit'),
                    remove: this.getI18nByKey('remove'),
                    configAction: this.getI18nByKey('configAction'),
                    moveUp: this.getI18nByKey('up'),
                    moveDown: this.getI18nByKey('down'),
                    addingCalibrator: this.getI18nByKey('addingCalibrator'),
                    ok: this.getI18nByKey('ok'),
                    cancel: this.getI18nByKey('cancel'),
                    basicInform: this.getI18nByKey('basicInform'),
                    parityRegulator: this.getI18nByKey('parityRegulator'),
                    enterName: this.getI18nByKey('enterName'),
                    enterBusinessName: this.getI18nByKey('enterBusinessName'),
                    enterInternalName: this.getI18nByKey('enterInternalName'),
                    selectApp: this.getI18nByKey('selectApp'),
                    selectType: this.getI18nByKey('selectType'),
                    enterDesc: this.getI18nByKey('enterDesc'),
                    pName: this.getI18nByKey('pName'),
                    serviceName: this.getI18nByKey('serviceName'),
                    showName: this.getI18nByKey('showName'),
                    tips: this.getI18nByKey('tips'),
                    removeCdata: this.getI18nByKey('removeCdata'),
                    classify: this.getI18nByKey('classify'),
                    operationName: this.getI18nByKey('operationName'),
                    confitActions: this.getI18nByKey('confitActions'),
                    updateGroovy: this.getI18nByKey('updateGroovy'),
                    addLeastOneTip: this.getI18nByKey('addLeastOneTip'),
                    config: this.getI18nByKey('config')
                },
                formData: {},
                unfold: {
                    basicInform: true,
                    parityRegulator: true
                },
                tableData: [],
                dialogObj: {
                    visible: false,
                    type: '',
                    title: '',
                    loading: false
                },
                // 所属应用
                appList: [],
                // 所属类型
                typeList: [],
                currentRow: {}
            };
        },
        watch: {
            'buttonInfo.timeStamp': {
                handler: function () {
                    this.$nextTick(() => {
                        this.formData = {};
                        this.$refs?.dynamicForm?.$refs?.form.resetFields();
                        this.buttonInfo.type && this.buttonInfo.type !== 'create' && this.getButtonDetails();
                    });
                },
                immediate: true
            }
        },
        computed: {
            // 是否只读
            readonly() {
                return this.buttonInfo.type === 'view';
            },
            // 表单数据
            data() {
                return [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.nameI18nJson,
                        required: !this.readonly,
                        disabled: false,
                        hidden: false,
                        validators: [
                            {
                                type: 'FamI18nbasicsRequired'
                            }
                        ],
                        props: {
                            clearable: true,
                            disabled: false,
                            placeholder: this.i18nMappingObj.enterName,
                            placeholderLangKey: this.i18nMappingObj.enterName,
                            i18nName: this.i18nMappingObj.nameI18nJson,
                            type: 'basics',
                            trimValidator: true
                        },
                        col: 12
                    },
                    {
                        field: 'businessName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.businessName,
                        required: !this.readonly,
                        disabled: false,
                        hidden: false,
                        validators: [],
                        props: {
                            clearable: true,
                            disabled: false,
                            placeholder: this.i18nMappingObj.enterBusinessName
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.operationName,
                        required: this.buttonInfo.type !== 'edit',
                        disabled: this.buttonInfo.type === 'edit',
                        readonly: this.buttonInfo.type === 'edit',
                        hidden: false,
                        validators: [],
                        props: {
                            clearable: true,
                            disabled: false,
                            placeholder: this.i18nMappingObj.enterInternalName
                        },
                        col: 12
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: this.i18nMappingObj.appName,
                        required: false,
                        disabled: true,
                        readonly: true,
                        hidden: false,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.selectApp,
                            multiple: false,
                            filterable: true,
                            row: {
                                filterable: true,
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.appList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'typeName',
                        component: 'custom-select',
                        label: this.i18nMappingObj.typeName,
                        required: false,
                        disabled: true,
                        readonly: true,
                        hidden: false,
                        validators: [],
                        props: {
                            'clearable': true,
                            'placeholder': this.i18nMappingObj.selectType,
                            'multiple': false,
                            'filterable': true,
                            'popper-class': 'type-name-selete',
                            'row': {
                                filterable: true,
                                componentName: 'constant-select',
                                viewProperty: 'label',
                                valueProperty: 'value',
                                referenceList: this.typeList
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'icon',
                        component: 'FamIconSelect',
                        label: this.i18nMappingObj.icon,
                        labelLangKey: this.i18nMappingObj.icon,
                        hidden: false,
                        validators: [],
                        type: 'icon',
                        props: {
                            title: this.i18nMappingObj.sselectIcon,
                            visibleBtn: true,
                            btnName: this.i18nMappingObj.sselectIcon,
                            visibleTips: true,
                            placeholder: '',
                            tips: this.i18nMappingObj.IconTips,
                            clearable: true
                        },
                        col: 12
                    },
                    {
                        field: 'enabled',
                        component: 'FamRadio',
                        label: this.i18nMappingObj.enabled,
                        disabled: false,
                        required: !this.readonly,
                        hidden: true,
                        validators: [{ required: true, message: '请选择默认状态', trigger: 'blur' }],
                        props: {
                            type: 'radio',
                            options: [
                                {
                                    label: '启用',
                                    value: true
                                },
                                {
                                    label: '禁用',
                                    value: false
                                }
                            ],
                            placeholder: ''
                        },
                        col: 12
                    },
                    {
                        field: 'classifyI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.classify,
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [
                            {
                                type: 'FamI18nbasicsRequired'
                            }
                        ],
                        props: {
                            clearable: true,
                            disabled: false,
                            placeholder: this.i18nMappingObj.enterName,
                            i18nName: this.i18nMappingObj.classify,
                            type: 'basics',
                            trimValidator: true
                        },
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.descriptionI18nJson,
                        required: true,
                        validators: [
                            {
                                type: 'FamI18nbasicsRequired'
                            }
                        ],
                        props: {
                            type: 'textarea',
                            row: 3,
                            clearable: true,
                            i18nName: this.i18nMappingObj.descriptionI18nJson,
                            placeholder: this.i18nMappingObj.enterDesc,
                            placeholderLangKey: this.i18nMappingObj.enterDesc
                        },
                        col: 24,
                        slots: {}
                    }
                ];
            },
            // 表格列头
            column() {
                let column = [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'serverName', // 列数据字段key
                        title: this.i18nMappingObj.serviceName, // 列头部标题
                        minWidth: '200'
                    },
                    {
                        prop: 'filterName', // 列数据字段key
                        title: this.i18nMappingObj.name, // 列头部标题
                        minWidth: '200'
                    },
                    {
                        prop: 'displayName', // 列数据字段key
                        title: this.i18nMappingObj.pName, // 列头部标题
                        minWidth: '200'
                    },
                    {
                        prop: 'description', // 列数据字段key
                        title: '描述', // 列头部标题
                        minWidth: '200'
                    },
                    {
                        prop: 'typeName', // 列数据字段key
                        title: '类型名称', // 列头部标题
                        minWidth: '200'
                    }
                ];
                if (!this.readonly) {
                    column.push({
                        prop: 'operation',
                        title: '操作',
                        width: '72',
                        sort: false,
                        fixed: 'right'
                    });
                }
                return column;
            },
            singleButton() {
                return this.buttonInfo?.singleButton || null;
            }
        },
        created() {
            this.getAppList();
        },
        methods: {
            // 获取所属应用
            getAppList() {
                this.$famHttp({
                    url: '/fam/user/getCurrentTenantApplicationList',
                    method: 'get'
                })
                    .then((rep) => {
                        let appList = rep?.data || [];
                        this.appList = _.map(appList, (item) => {
                            return { label: item.displayName, value: item.identifierNo };
                        });
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // });
                    });
            },
            // 查询所属类型
            fnGetTypes() {
                this.$famHttp({
                    url: '/fam/view/getTypeListByContainerRef',
                    method: 'get',
                    params: {
                        containerRef: this.$store?.state?.app?.container?.oid,
                        typeName: ''
                    },
                    headers: {
                        'App-Name': this.formData?.appName || 'sample'
                    }
                })
                    .then((rep) => {
                        let res = rep?.data || {};
                        let data = res?.childTypeDefList || [];
                        this.typeList = _.map(data, (item) => {
                            return { label: item.displayName, value: item.typeName };
                        });
                    })
                    .catch(() => {});
            },
            // 获取按钮详情
            getButtonDetails() {
                let _this = this;
                this.$famHttp({
                    url: `/fam/menuaction/action/${this.singleButton.id}`,
                    method: 'get'
                }).then(async (res) => {
                    if (res.success) {
                        let data = res?.data || {},
                            filters = data.filters || [];
                        _.keys(data).forEach((item) => {
                            if (item.includes('I18nJson')) {
                                data[item] = {
                                    attrName: item,
                                    value: data[item]
                                };
                            }
                        });
                        _this.formData = data;
                        _this.tableData = filters;
                        _this.initSelectionChange({
                            multipleSelection: _.map(_this.tableData, (item) => _.extend({}, item))
                        });
                        this.fnGetTypes();
                    }
                });
            },
            // 初始化已选校验器数据
            initSelectionChange({ multipleSelection = [] }) {
                this.multipleSelection = multipleSelection;
            },
            handleCommand(command, row, $index) {
                switch (command) {
                    case 'config':
                        setTimeout(() => {
                            this.setDialogObj({ visible: true, type: 'config', row: row });
                        }, 500);
                        break;
                    case 'remove':
                        this.removeButton(row);
                        break;
                    case 'moveUp':
                        this.moveUp(row, $index);
                        break;
                    case 'moveDown':
                        this.moveDown(row, $index);
                        break;
                    default:
                        break;
                }
            },
            async setDialogObj({ visible, type, callback, row = {} }) {
                if (visible) {
                    this.dialogObj.type = type;
                    this.currentRow = row;
                    if (type) {
                        const titleMap = {
                            add: 'addingCalibrator',
                            config: 'config'
                        };
                        this.dialogObj.title = this.i18nMappingObj[titleMap[type]];
                    }
                    if (type === 'config') {
                        const { groovyScriptVoList, ruleConditionDtoList, constantRef } =
                            await this.queryMenuActionList();
                        this.$set(this.currentRow, 'groovyScriptVoList', groovyScriptVoList);
                        this.$set(this.currentRow, 'ruleConditionDtoList', ruleConditionDtoList);
                        this.$set(this.currentRow, 'constantRef', constantRef);
                        this.$nextTick(() => {
                            this.dialogObj.visible = visible;
                        });
                        return;
                    }
                }
                this.dialogObj.visible = visible;
                callback && callback();
            },
            queryMenuActionList() {
                return this.$famHttp({
                    url: '/fam/menu/queryMenuActionFilterById',
                    method: 'get',
                    params: {
                        id: this.currentRow.id
                    }
                })
                    .then((resp) => {
                        this.actionListCopy = resp.data?.groovyScriptVoList || [resp.data?.groovyScriptVo || {}];
                        const { ruleConditionDtoList, constantRef, typeRef } = resp.data;
                        return { groovyScriptVoList: this.actionListCopy, ruleConditionDtoList, constantRef, typeRef };
                    })
                    .catch(() => {});
            },
            // 更新服务名称
            updateShortName(shortName) {
                this.shortName = shortName;
            },
            fnOnSubmit() {
                switch (this.dialogObj.type) {
                    case 'add':
                        this.addingCalibrator();
                        break;
                    case 'config':
                        this.handleGroovyCalibrator();
                        break;
                    default:
                        break;
                }
            },
            // 增加校验器
            addingCalibrator() {
                const obtainFinalData = this.$refs?.checker?.obtainFinalData() || [];
                if (!obtainFinalData.length) {
                    this.$message.warning(this.i18nMappingObj['addLeastOneTip']);
                    return;
                }
                this.dialogObj.loading = true;
                let className = this.$store.getters.className('menuActionFilter');
                let url = '/fam/saveOrUpdate';
                const rawDataVoList = _.map(obtainFinalData, (item) => {
                    return {
                        className,
                        attrRawList: [
                            {
                                attrName: 'actionId',
                                value: this.singleButton.id
                            },
                            {
                                attrName: 'actionKey',
                                value: this.singleButton.idKey
                            },
                            {
                                attrName: 'filterName',
                                value: item.beanName
                            },
                            {
                                attrName: 'serverName',
                                value: this.shortName
                            }
                        ]
                    };
                });
                this.$famHttp({
                    url,
                    data: {
                        action: 'CREATE',
                        className,
                        rawDataVoList
                    },
                    method: 'post'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message.success('添加校验器成功');
                        }
                        setTimeout(() => {
                            this.setDialogObj({ visible: false, callback: this.getButtonDetails });
                        }, 500);
                    })
                    .catch(() => {})
                    .finally(() => {
                        this.dialogObj.loading = false;
                    });
            },
            // 点击移除按钮
            removeButton(row) {
                this.$confirm(this.i18nMappingObj.removeCdata, this.i18nMappingObj.tips, {
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                })
                    .then(() => {
                        this.removeCalibrator(row);
                    })
                    .catch(() => {});
            }, // 移除校验器
            removeCalibrator(row) {
                this.$famHttp({
                    url: '/fam/delete',
                    params: {
                        oid: row.oid
                    },
                    method: 'delete'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message.success('移除校验器成功');
                        }
                        this.getButtonDetails();
                    })
                    .catch((error) => {
                        this.$message({
                            type: 'error',
                            message: error?.data?.message || '移除校验器失败'
                        });
                    });
            },
            visibleChange(visible, row) {
                this.$set(row, 'visible', visible);
            },
            // 保存校验器
            handleGroovyCalibrator() {
                const groovyFilterRef = this.$refs?.groovyFilter;
                groovyFilterRef
                    ?.submit()
                    .then(({ formData, addedTableData = [], ruleEngineData = null, participantData = null }) => {
                        const isUpdateGroovy = this.dialogObj.type === 'updateGroovy';
                        const groovyScriptList = addedTableData.map((item, index) => {
                            let tempItem = {
                                sordOrder: index,
                                roleAObjectRef: item?.vid?.replace('VR:', 'OR:')
                            };

                            if (isUpdateGroovy) {
                                const updateObj = this.actionListCopy.find((copyItem) => copyItem.name === item.name);
                                if (updateObj) {
                                    tempItem.id = updateObj.id;
                                    tempItem.idKey = updateObj.idKey;
                                }
                            }
                            return tempItem;
                        });
                        const className = this.$store.getters.className('menuActionFilter');
                        let relationList = [];
                        if (ruleEngineData || participantData) {
                            relationList = [
                                {
                                    action: formData.constantRef ? 'UPDATE' : 'CREATE',
                                    associationField: 'holderRef',
                                    attrRawList: [
                                        {
                                            attrName: 'name',
                                            value: 'filter'
                                        },
                                        {
                                            attrName: 'typeReference',
                                            value: this.formData?.typeRef || ''
                                        }
                                    ],
                                    className: 'erd.cloud.foundation.type.entity.ConstantDefinition',
                                    relationList: ruleEngineData || participantData
                                }
                            ];
                        }
                        if (formData.constantRef) {
                            delete relationList[0].attrRawList;
                            relationList[0].oid = formData.constantRef;
                        }
                        let rawDataVoList = [
                            {
                                className,
                                attrRawList: [
                                    {
                                        attrName: 'actionId',
                                        value: this.singleButton.id
                                    },
                                    {
                                        attrName: 'actionKey',
                                        value: this.singleButton.idKey
                                    },
                                    {
                                        attrName: 'filterName',
                                        value: formData.name
                                    },
                                    {
                                        attrName: 'displayName',
                                        value: formData.businessName
                                    },
                                    {
                                        attrName: 'description',
                                        value: formData.description
                                    },
                                    {
                                        attrName: 'serverName',
                                        value: formData.serverName
                                    },
                                    {
                                        attrName: 'groovyScriptList',
                                        value: groovyScriptList
                                    },
                                    {
                                        attrName: 'config',
                                        value: formData.config
                                    },
                                    {
                                        attrName: 'failSet',
                                        value: formData.failSet
                                    },
                                    {
                                        attrName: 'succeedSet',
                                        value: formData.succeedSet
                                    },
                                    {
                                        attrName: 'validateI18nJson',
                                        value: formData.validateI18nJson
                                    }
                                ],
                                associationField: 'holderRef',
                                relationList
                            }
                        ];
                        rawDataVoList[0].oid = this.currentRow.oid;
                        let url = '/fam/saveOrUpdate';
                        this.dialogObj.loading = true;
                        this.$famHttp({
                            url,
                            data: {
                                action: 'UPDATE',
                                className,
                                rawDataVoList
                            },
                            method: 'post'
                        })
                            .then((res) => {
                                if (res.success) {
                                    this.$message.success('添加校验器成功');
                                }
                                setTimeout(() => {
                                    this.setDialogObj({ visible: false, callback: this.getButtonDetails });
                                }, 500);
                            })
                            .catch(() => {})
                            .finally(() => {
                                this.dialogObj.loading = false;
                            });
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            },
            // 表单校验
            async submit(callback) {
                const { dynamicForm } = this.$refs,
                    { submit, serializeEditableAttr } = dynamicForm;
                submit()
                    .then(async (res) => {
                        if (res.valid) {
                            const form = serializeEditableAttr() || {};
                            res = await this.addEditButton({ form });
                            if (res.success) {
                                setTimeout(() => {
                                    callback({ valid: true });
                                }, 500);
                            }
                            this.$message.success('保存成功');
                        } else {
                            callback({ valid: false });
                        }
                    })
                    .catch((err) => {
                        callback({ valid: err.valid });
                    });
            },
            // 创建更新按钮
            addEditButton({ form }) {
                let data = {},
                    filterList = ['name'],
                    formattForm = (form) => {
                        return _.map(form, (item) => {
                            if (item.attrName.includes('I18nJson')) {
                                utils.trimI18nJson(item?.value?.value);
                                item = { attrName: item.attrName, value: item?.value?.value || {} };
                            } else if (item.attrName === 'businessName') {
                                item.value = item.value.trim();
                            }
                            return item;
                        });
                    };
                data.className = this.$store.getters.className('actionList');
                data.attrRawList = formattForm(form);
                this.buttonInfo.type === 'edit' &&
                    (data.attrRawList = _.filter(data.attrRawList, (item) => filterList.indexOf(item.attrName) === -1));
                this.buttonInfo.type === 'edit' && (data.action = 'UPDATE');
                this.buttonInfo.type === 'edit' && (data.oid = this.singleButton.oid);
                return this.$famHttp({
                    url: this.buttonInfo.type === 'create' ? '/fam/create' : '/fam/update',
                    data,
                    method: 'post'
                });
            },
            // 上移
            moveUp(row, index) {
                if (index === 0) {
                    return this.$message({
                        type: 'warning',
                        message: '已至第一位，不可上移'
                    });
                }
                const data = this.tableData.splice(index, 1);
                this.tableData.splice(index - 1, 0, data[0]);
            },
            // 下移
            moveDown(row, index) {
                if (index === this.tableData.length - 1) {
                    return this.$message({
                        type: 'warning',
                        message: '已至最后一位，不可下移'
                    });
                }
                const data = this.tableData.splice(index, 1);
                this.tableData.splice(index + 1, 0, data[0]);
            }
        }
    };
});
