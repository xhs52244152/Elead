define([
    'text!' + ELMP.resource('system-operation-menu/components/ScenarioDetails/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-operation-menu/components/ScenarioDetails/style.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            // 按钮组合信息
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
                    appName: this.getI18nByKey('appName'),
                    typeName: this.getI18nByKey('typeName'),
                    icon: this.getI18nByKey('icon'),
                    sselectIcon: this.getI18nByKey('sselectIcon'),
                    IconTips: this.getI18nByKey('IconTips'),
                    enabled: this.getI18nByKey('enabled'),
                    descriptionI18nJson: this.getI18nByKey('descriptionI18nJson'),
                    increase: this.getI18nByKey('increase'),
                    remove: this.getI18nByKey('remove'),
                    addingCalibrator: this.getI18nByKey('addingCalibrator'),
                    ok: this.getI18nByKey('ok'),
                    cancel: this.getI18nByKey('cancel'),
                    basicInform: this.getI18nByKey('basicInform'),
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
                    buttonInformation: this.getI18nByKey('buttonInformation'),
                    actionSearchPlaceholder: this.getI18nByKey('actionSearchPlaceholder'),
                    status: this.getI18nByKey('status'),
                    enableAfterValidator: this.getI18nByKey('enableAfterValidator'),
                    operation: this.getI18nByKey('operation'),
                    anotherName: this.getI18nByKey('anotherName'),
                    enable: this.getI18nByKey('enable'),
                    disable: this.getI18nByKey('disable'),
                    hide: this.getI18nByKey('hide'),
                    display: this.getI18nByKey('display'),
                    more: this.getI18nByKey('more'),
                    up: this.getI18nByKey('up'),
                    down: this.getI18nByKey('down'),
                    buttonDetails: this.getI18nByKey('buttonDetails'),
                    menuDetails: this.getI18nByKey('menuDetails'),
                    operationName: this.getI18nByKey('operationName'),
                    operatingSceneName: this.getI18nByKey('operatingSceneName'),
                    anotherNameTips: this.getI18nByKey('anotherNameTips')
                },
                functionButton: {
                    visible: false,
                    type: '',
                    loading: false,
                    detailsInfo: {}
                },
                tableData: [],
                loading: false,
                // 表格搜索关键字
                shearchKey: '',
                // 按钮组合详情
                buttonComDetails: {},
                // 按钮详情
                buttonDetails: {},
                unfold: {
                    basicInform: true,
                    buttonInformation: true
                },
                validRules: {
                    anotherName: [{ required: true }]
                },
                editRow: {},
                maxHeight: 300,
                heightDiff: 390
            };
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            Checker: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/components/Checker/index.js')),
            ActionListTable: ErdcKit.asyncComponent(
                ELMP.resource('system-operation-menu/components/ActionListTable/index.js')
            ),
            FamInfoTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js'))
        },
        watch: {
            'buttonInfo.id': {
                handler: function () {
                    this.$nextTick(() => {
                        this.getButtonDetails();
                    });
                }
            }
        },
        computed: {
            readonly() {
                return true;
            },
            // 按钮组合表单数据
            buttonComFromList() {
                return [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.nameI18nJson,
                        required: false,
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
                            type: 'basics'
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.operatingSceneName,
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: true,
                            disabled: false,
                            placeholder: this.i18nMappingObj.enterBusinessName
                        },
                        col: 12
                    },
                    {
                        field: 'isAfterValidator',
                        component: 'FamRadio',
                        label: this.i18nMappingObj.enableAfterValidator,
                        disabled: false,
                        required: false,
                        hidden: false,
                        props: {
                            type: 'radio',
                            options: [
                                {
                                    label: this.i18n.yes,
                                    value: true
                                },
                                {
                                    label: this.i18n.no,
                                    value: false
                                }
                            ],
                            placeholder: ''
                        },
                        col: 12
                    },
                    {
                        field: 'status',
                        component: 'FamRadio',
                        label: this.i18nMappingObj.status,
                        disabled: false,
                        required: false,
                        hidden: false,
                        props: {
                            type: 'radio',
                            options: [
                                {
                                    label: '显示',
                                    value: true
                                },
                                {
                                    label: '隐藏',
                                    value: false
                                }
                            ],
                            placeholder: ''
                        },
                        col: 12
                    },
                    {
                        field: 'moduleClassifyI18n',
                        label: this.i18n.module,
                        component: 'erd-input',
                        readonly: true,
                        col: 12
                    },
                    {
                        field: 'appNameI18n',
                        label: this.i18n.application,
                        component: 'erd-input',
                        readonly: true,
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.descriptionI18nJson,
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
            // 表格列配置
            column() {
                let column = [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'nameI18nJson', // 显示名称
                        title: this.i18nMappingObj.showName,
                        minWidth: '100',
                        treeNode: true
                    },
                    {
                        prop: 'anotherName', // 别名
                        title: this.i18nMappingObj.anotherName,
                        tips: this.i18nMappingObj.anotherNameTips,
                        minWidth: '200',
                        editRender: {},
                        required: true
                    },
                    {
                        prop: 'businessName', // 业务名称
                        title: this.i18nMappingObj.businessName,
                        minWidth: '100'
                    },
                    {
                        prop: 'name', // 内部名称
                        title: this.i18nMappingObj.operationName,
                        minWidth: '100'
                    },
                    {
                        prop: 'status', // 状态
                        title: this.i18nMappingObj.status,
                        minWidth: '100'
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj.operation,
                        width: '150',
                        sort: false,
                        fixed: 'right'
                    }
                ];
                return column;
            },
            isEdit() {
                return this.buttonInfo?.edit ?? true;
            }
        },
        created() {
            //获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
            this.maxHeight = document.documentElement.clientHeight - this.heightDiff;
        },
        methods: {
            /**
             * 自定义判断什么时候显示tooltip
             * @param {*} data
             * @returns
             */
            contentMethod(data) {
                const { type, column, row, cell } = data;
                if (type === 'header') {
                    for (let item of this.column) {
                        if (item.prop === column.field) {
                            if (item.toolTipsAble || item.tips || !column.title) {
                                return null;
                            }
                            return column.title;
                        }
                    }
                }
                if ($(cell).width()) {
                    if ($(cell).find('span').width() >= $(cell).width() - 32) {
                        return row.detail || null;
                    } else {
                        return '';
                    }
                }
            },
            //===========编辑表格START=============//
            editActived(data) {
                const { row, column } = data;
                this.editRow = row || {};
            },
            i18nValueInput(value, data, property) {
                const { row } = data;
                row[property] = value?.value;
                this.editRow = row || {};
            },
            validRow() {
                if (_.isEmpty(this.editRow?.anotherName?.value)) {
                    this.$message.warning('请先编辑别名');
                    return false;
                }
                return this.$refs?.erdTable?.validTableRow(this.editRow);
            },
            // 查看按钮详情
            viewButtonDetails(row) {
                let type = _.isArray(row.children) && row.children.length ? 'menu' : 'button';
                let detailsInfo =
                    type === 'button'
                        ? {
                              timeStamp: new Date().getTime(),
                              type: 'view',
                              singleButton: _.extend({}, row.singleButton)
                          }
                        : _.extend({}, row.singleButton);
                this.operatingPopover({ visible: true, type, detailsInfo });
            },
            // 点击表格按钮
            clickTableButton(button, row) {
                let confirmText = '',
                    clickEventName = '';
                switch (button.command) {
                    case 'HIDE':
                        confirmText = '你确定要隐藏该按钮吗？';
                        clickEventName = 'hdButtonOper';
                        break;
                    case 'ENABLE':
                        confirmText = '你确定要启用该按钮吗？';
                        clickEventName = 'hdButtonOper';
                        break;
                    case 'DISABLE':
                        confirmText = '你确定要禁用该按钮吗？';
                        clickEventName = 'hdButtonOper';
                        break;
                    case 'UP':
                        confirmText = '你确定要上移该按钮吗？';
                        clickEventName = 'moveButtonOper';
                        break;
                    case 'DOWN':
                        confirmText = '你确定要下移该按钮吗？';
                        clickEventName = 'moveButtonOper';
                        break;
                    default:
                        break;
                }
                this.$confirm(confirmText, this.i18nMappingObj.tips, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.ok,
                    cancelButtonText: this.i18nMappingObj.cancel
                })
                    .then(() => {
                        this[clickEventName]({ button, row });
                    })
                    .catch(() => {});
            },
            // 隐藏显示按钮
            hdButtonOper({ button = {}, row = {} }) {
                let data = {
                    className: 'erd.cloud.foundation.core.menu.entity.MenuModuleActionLink',
                    attrRawList: [
                        {
                            attrName: 'status',
                            value: +button.status
                        }
                    ],
                    action: 'UPDATE',
                    oid: row.oid
                };
                this.$famHttp({
                    url: `/fam/update`,
                    data,
                    method: 'post'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message.success(
                                '按钮' +
                                    (button.command === 'HIDE'
                                        ? '隐藏'
                                        : button.command === 'ENABLE'
                                          ? '启用'
                                          : '禁用') +
                                    '成功'
                            );
                        }
                        setTimeout(() => {
                            this.getButtonDetails();
                        }, 500);
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || '请求失败'
                        // })
                    });
            },
            // 按钮上下移
            moveButtonOper({ button = {}, row = {} }) {
                this.$famHttp({
                    url: `/fam/menuaction/action/sort/${row.id}/${button.status}`,
                    method: 'get'
                })
                    .then((res) => {
                        if (res.success) {
                            this.$message.success('按钮' + (button.command === 'UP' ? '上移' : '下移') + '成功');
                        }
                        setTimeout(() => {
                            this.getButtonDetails();
                        }, 500);
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || '请求失败'
                        // })
                    });
            },
            // 获取按钮组合详情
            getButtonDetails() {
                let _this = this;
                _this.loading = true;
                this.$famHttp({
                    url: `/fam/menuaction/module/${this.buttonInfo.id}`,
                    method: 'get'
                })
                    .then((res) => {
                        if (res.success) {
                            let data = res?.data || {},
                                actionLinkDtos = data.actionLinkDtos || [],
                                extractParamMap = data?.extractParamMap || {};
                            _this.buttonComDetails = _.chain(data)
                                .omit('actionLinkDtos')
                                .extend({
                                    nameI18nJson: { attrName: 'nameI18nJson', value: data.nameI18nJson || {} },
                                    descriptionI18nJson: {
                                        attrName: 'descriptionI18nJson',
                                        value: data.descriptionI18nJson || {}
                                    }
                                })
                                .value();
                            _this.buttonComDetails = { ..._this.buttonComDetails, ...extractParamMap };
                            _this.tableData = this.assembleTableData(actionLinkDtos);
                        }
                    })
                    .finally(() => {
                        _this.loading = false;
                    });
            },
            // 组装表格数据（树结构）
            assembleTableData(actionLinkDtos) {
                let getActionLinkDtos = (actionLinkDtos) => {
                    let tableData = [];
                    actionLinkDtos.sort((a, b) => {
                        return a.sortOrder - b.sortOrder;
                    });
                    for (let i = 0; i < actionLinkDtos.length; i++) {
                        let row = actionLinkDtos[i];
                        tableData[i] = this.newTableDataRow(row, actionLinkDtos);
                        if (row.moduleDto) {
                            tableData[i].children = getActionLinkDtos(row.moduleDto.actionLinkDtos);
                        }
                    }
                    return tableData;
                };
                return getActionLinkDtos(actionLinkDtos);
            },
            newTableDataRow(row, actionLinkDtos) {
                return {
                    // eslint-disable-next-line no-unsafe-optional-chaining
                    singleButton: _.chain(row?.moduleDto || row?.actionDto)
                        .omit('actionLinkDtos')
                        .extend({
                            nameI18nJson: {
                                attrName: 'nameI18nJson',
                                value: (row?.moduleDto || row?.actionDto || {}).nameI18nJson || {}
                            },
                            descriptionI18nJson: {
                                attrName: 'descriptionI18nJson',
                                value: (row?.moduleDto || row?.actionDto || {}).descriptionI18nJson || {}
                            }
                        })
                        .value(),
                    id: row?.id,
                    oid: row?.oid || '',
                    status: row?.status,
                    name: row?.moduleDto?.name || row?.actionDto?.name || '',
                    businessName: row?.moduleDto?.businessName || row?.actionDto?.businessName || '',
                    anotherName: row?.nameI18nJson || {},
                    nameI18nJson: row?.moduleDto?.nameI18nJson?.value || row?.actionDto?.nameI18nJson?.value,
                    children: [],
                    buttonList: [
                        {
                            title: this.i18nMappingObj.up,
                            command: 'UP',
                            status: 'UP',
                            children: [],
                            show: true,
                            disabled: ({ index = 0 }) => {
                                return !index;
                            }
                        },
                        {
                            title: this.i18nMappingObj.down,
                            command: 'DOWN',
                            status: 'DOWN',
                            children: [],
                            show: true,
                            disabled: ({ index = 0 }) => {
                                return index === actionLinkDtos.length - 1;
                            }
                        },
                        {
                            title: this.i18nMappingObj.more,
                            command: 'MORE',
                            show: true,
                            children: [
                                {
                                    title: this.i18nMappingObj.enable,
                                    command: 'ENABLE',
                                    children: [],
                                    status: 0,
                                    show: row.status !== 0
                                },
                                {
                                    title: this.i18nMappingObj.disable,
                                    command: 'DISABLE',
                                    children: [],
                                    status: 1,
                                    show: row.status !== 1
                                },
                                {
                                    title: this.i18nMappingObj.hide,
                                    command: 'HIDE',
                                    children: [],
                                    status: 2,
                                    show: row.status !== 2
                                }
                            ]
                        }
                    ]
                };
            },
            // 打开关闭校验器弹窗
            operatingPopover({ visible = false, type = '', detailsInfo = {}, callback = null }) {
                this.functionButton.detailsInfo = detailsInfo;
                this.functionButton.type = type;
                this.functionButton.visible = visible;
                _.isFunction(callback) && callback();
            }
        }
    };
});
