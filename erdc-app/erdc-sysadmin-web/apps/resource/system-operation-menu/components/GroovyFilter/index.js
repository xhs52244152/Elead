define([
    'text!' + ELMP.resource('system-operation-menu/components/GroovyFilter/index.html'),
    ELMP.resource('system-operation-menu/componentConfig.js'),
    'css!' + ELMP.resource('system-operation-menu/components/GroovyFilter/style.css')
], function (template, componentConfig) {
    const ErdcKit = require('erdcloud.kit');
    const TYPEMAP = {
        groovy: 'erd.cloud.core.menu.filter.groovy.GroovyMenuValidatorFilter', // 脚本
        rule: 'erd.cloud.core.menu.filter.RuleMenuValidatorFilter',
        custom: 'custom', // 自定义
        participantRule: 'erd.cloud.core.menu.filter.acl.ParticipantFilter', // 三员 当前用户规则
        object: 'erd.cloud.core.menu.filter.ObjectAccessFilter' // 对象权限
    };
    return {
        template,
        props: {
            row: {
                type: Object,
                default: () => ({})
            },
            dialogType: {
                type: String,
                default: ''
            },
            singleButton: {
                type: Object,
                default: () => ({})
            }
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamRuleEngine: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamRuleEngine/index.js')),
            GroovyFilterConfig: ErdcKit.asyncComponent(
                ELMP.resource('system-operation-menu/components/GroovyFilterConfig/index.js')
            ),
            CodeFilter: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/components/CodeFilter/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                i18nMappingObj: {
                    typeName: this.getI18nByKey('verifierType'),
                    validatorExecutesDesc: this.getI18nByKey('validatorExecutesDesc'),
                    name: this.getI18nByKey('name'),
                    businessName: this.getI18nByKey('businessName'),
                    descriptionI18nJson: this.getI18nByKey('descriptionI18nJson'),
                    addValidator: this.getI18nByKey('addValidator'),
                    addScript: this.getI18nByKey('addScript'),
                    playceholderTips: this.getI18nByKey('playceholderTips'),
                    add: this.getI18nByKey('add'),
                    ok: this.getI18nByKey('ok'),
                    remove: this.getI18nByKey('remove'),
                    cancel: this.getI18nByKey('cancel'),
                    scriptExcutesTips: this.getI18nByKey('scriptExcutesTips'),
                    servicePlaceholder: this.getI18nByKey('servicePlaceholder'),
                    addLeastOneTip: this.getI18nByKey('addLeastOneTip')
                },
                form: {
                    type: '',
                    typeName: '',
                    name: '',
                    businessName: '',
                    description: '',
                    isTrue: true,
                    isFalse: false,
                    succeedSet: 'ENABLED',
                    failSet: 'HIDDEN',
                    validateI18nJson: {
                        attrName: 'validateI18nJson',
                        value: {}
                    },
                    participantObj: {
                        condition: 'EQ',
                        participant: {
                            type: 'USER',
                            value: []
                        },
                        oldParticipant: []
                    }
                },
                rules: {
                    typeName: [{ required: true, message: '请选择类型', trigger: 'blur' }],
                    name: [{ required: true, message: '请输入内部名称', trigger: 'blur' }],
                    businessName: [{ required: true, message: '请输入业务名称', trigger: 'blur' }]
                },
                selectTypeList: [],
                verifierTableData: [],
                verifierColumns: [
                    {
                        label: '序号',
                        key: 'seq',
                        width: 48
                    },
                    {
                        label: '类型',
                        key: 'typeName',
                        width: 200
                    },
                    {
                        label: '说明',
                        key: 'description'
                    }
                ],
                addedTableData: [],
                addedTableLoading: false,
                commonColumns: [
                    {
                        type: 'radio',
                        width: 40
                    },
                    {
                        type: 'seq',
                        title: '序号',
                        width: 48
                    },
                    {
                        prop: 'displayName',
                        title: '显示名称'
                    },
                    {
                        prop: 'name',
                        title: '内部名称'
                    },
                    {
                        prop: 'description',
                        title: '描述',
                        width: 300
                    },
                    {
                        prop: 'functionName',
                        title: '调用方法'
                    },
                    {
                        prop: 'versionStr',
                        title: '版本'
                    },
                    {
                        prop: 'createTime',
                        title: '创建日期'
                    },
                    {
                        prop: 'operation',
                        title: '操作',
                        width: 80
                    }
                ],
                groovyTableData: [],
                dialogVisible: false,
                dialogTitle: '',
                dialogForm: {
                    searchKey: '',
                    serviceName: '',
                    appName: ''
                },
                phaseRow: {
                    componentName: 'virtual-select',
                    clearNoData: true,
                    requestConfig: {
                        url: '/platform/service/list',
                        viewProperty: 'displayName',
                        valueProperty: 'shortName'
                    }
                },
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                },
                saveBtnLoading: false,
                checkRowKey: '',
                checkRowNames: [],
                ruleConditionDtoList: [],
                isUpdate: false,
                limitConfigList: [],
                configVisible: false
            };
        },
        computed: {
            addedColumns() {
                return this.commonColumns.filter((item) => item.type !== 'radio');
            },
            groovyColumns() {
                return this.commonColumns.filter((item) => item.prop !== 'operation');
            },
            isGroovyVolidator() {
                return this.form.name.includes('GroovyMenuValidatorFilter');
            },
            formConfig() {
                const ruleChildrenMap = {
                    [TYPEMAP['groovy']]: {
                        field: 'addValidatorComponent',
                        label: ' ',
                        component: 'slot',
                        props: {
                            name: 'addvalidator'
                        },
                        col: 24
                    },
                    [TYPEMAP['rule']]: {
                        field: 'configRuleComponent',
                        label: ' ',
                        component: 'slot',
                        props: {
                            name: 'configrule'
                        },
                        col: 24
                    },
                    [TYPEMAP['custom']]: {
                        field: 'customComponent',
                        label: ' ',
                        component: 'slot',
                        props: {
                            name: 'custom'
                        },
                        col: 24
                    },
                    [TYPEMAP['participantRule']]: {
                        field: 'participantRuleComponent',
                        label: '当前用户',
                        component: 'slot',
                        props: {
                            name: 'participantrule'
                        },
                        col: 24
                    },
                    [TYPEMAP['object']]: {
                        field: 'objectConfig',
                        label: '配置权限',
                        component: 'custom-select',
                        props: {
                            multiple: true,
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'description',
                                valueProperty: 'name',
                                referenceList: this.limitConfigData
                            }
                        },
                        col: 24
                    }
                };
                let configRuleHidden;
                if (this.form?.type === TYPEMAP['participantRule']) {
                    configRuleHidden = false;
                } else {
                    configRuleHidden = this.form?.type === TYPEMAP['custom'] && !componentConfig[this.formType];
                }
                let config = [
                    {
                        component: 'fam-classification-title',
                        label: '基本信息',
                        props: {
                            unfold: true,
                            style: {
                                marginTop: '16px'
                            }
                        },
                        children: [
                            {
                                field: 'typeName',
                                component: 'erd-input',
                                label: this.i18nMappingObj['typeName'],
                                disabled: false,
                                hidden: false,
                                required: false,
                                readonly: true,
                                props: {},
                                col: 24
                            },
                            {
                                field: 'name',
                                component: 'erd-input',
                                label: this.i18nMappingObj['name'],
                                labelLangKey: 'name',
                                readonly: true,
                                validators: [],
                                col: 24
                            },
                            {
                                field: 'businessName',
                                component: 'erd-input',
                                label: this.i18nMappingObj['businessName'],
                                labelLangKey: 'businessName',
                                disabled: false,
                                required: true,
                                validators: [],
                                hidden: false,
                                col: 24
                            },
                            {
                                field: 'validateI18nJson',
                                component: 'FamI18nbasics',
                                label: this.i18n.verificationPrompt,
                                disabled: false,
                                required: false,
                                validators: [],
                                props: {
                                    clearable: false,
                                    i18nName: this.i18n.verificationPrompt,
                                    max: 100
                                },
                                col: 24
                            },
                            {
                                field: 'description',
                                component: 'erd-input',
                                label: this.i18nMappingObj['descriptionI18nJson'],
                                labelLangKey: 'descriptionI18nJson',
                                disabled: false,
                                required: false,
                                validators: [],
                                hidden: false,
                                clearable: true,
                                props: {
                                    'type': 'textarea',
                                    'maxlength': '300',
                                    'show-word-limit': true
                                },
                                col: 24
                            }
                        ],
                        col: 24
                    },
                    {
                        component: 'fam-classification-title',
                        label: '配置规则',
                        hidden: configRuleHidden,
                        props: {
                            unfold: true,
                            style: {
                                marginTop: '16px'
                            }
                        },
                        children: [ruleChildrenMap[this.form.type]],
                        col: 24
                    },
                    {
                        component: 'fam-classification-title',
                        label: '配置动作',
                        props: {
                            unfold: true,
                            style: {
                                marginTop: '16px'
                            }
                        },
                        children: this.actionConfigs,
                        col: 24
                    }
                ];
                return config;
            },
            actionConfigs() {
                return [
                    {
                        field: 'succeedSet',
                        component: 'slot',
                        label: '当校验结果 true',
                        tooltip:
                            '当校验结果为true并且执行动作选择禁用或隐藏时，校验结果为false的执行动作自动选中启用；当校验结果为true并且执行动作选择启用时，校验结果为false的执行动作自动选中隐藏',
                        props: {
                            name: 'succeedset'
                        },
                        col: 24
                    },
                    {
                        field: 'failSet',
                        component: 'slot',
                        label: '当校验结果 false',
                        tooltip:
                            '当校验结果为false并且执行动作选择禁用或隐藏时，校验结果为true的执行动作自动选中启用；当校验结果为false并且执行动作选择启用时，校验结果为true的执行动作自动选中隐藏',
                        props: {
                            name: 'failset'
                        },
                        col: 24
                    }
                ];
            },
            buttonOid() {
                return this.singleButton?.typeName || '';
            },
            className() {
                return this.$store?.getters.className('menuActionFilter');
            },
            limitConfigData() {
                const isAll = this.form.objectConfig?.includes('ALL');
                const limitConfigData = this.limitConfigList.map((item) => {
                    let obj = item;
                    obj.disabled = false;
                    if (isAll && item.name !== 'ALL') {
                        obj.disabled = true;
                        this.$set(this.form, 'objectConfig', ['ALL']);
                    }
                    return obj;
                });
                return limitConfigData;
            },
            configData() {
                let configData = null;
                try {
                    configData = JSON.parse(this.form.config);
                } catch {
                    configData = null;
                }
                return configData;
            },
            formType() {
                const nameArr = this.form?.filterName?.split('.') || [];
                return nameArr[nameArr.length - 1];
            },
            operatorOpts() {
                return [
                    {
                        label: '等于',
                        value: 'EQ'
                    },
                    {
                        label: '不等于',
                        value: 'NE'
                    },
                    {
                        label: '包含于',
                        value: 'IN'
                    },
                    {
                        label: '不包含于',
                        value: 'NOT_IN'
                    }
                ];
            },
            showType() {
                if (this.form.participantObj.condition.includes('IN')) {
                    return ['GROUP', 'ROLE', 'ORG'];
                } else {
                    return ['USER'];
                }
            },
            queryMode() {
                if (this.form.participantObj.condition.includes('IN')) {
                    return ['GROUP', 'ROLE', 'ORG'];
                } else {
                    return ['USER', 'FUZZYSEARCH'];
                }
            }
        },
        created() {
            this.initForm();
            this.getLimitList();
        },
        mounted() {
            // document.addEventListener('click', this.closeTableSelect, true);
        },
        beforeDestroy() {
            // document.removeEventListener('click', this.closeTableSelect, true);
        },
        methods: {
            initForm() {
                const {
                    displayName: businessName,
                    type,
                    filterName,
                    config,
                    groovyScriptVoList = [],
                    ruleConditionDtoList = []
                } = this.row;
                this.form = {
                    ...this.form,
                    ...this.row,
                    name: filterName,
                    businessName,
                    type
                };
                this.isUpdate = true;
                if (!_.isEmpty(ruleConditionDtoList)) {
                    this.isUpdate = true;
                    if (type === TYPEMAP['participantRule']) {
                        const { oper, userDtoList, orgList, groupList, roleList } = ruleConditionDtoList[0];
                        const valueMap = {
                            USER: userDtoList,
                            ORG: orgList,
                            GROUP: groupList,
                            ROLE: roleList
                        };
                        this.form.participantObj.condition = oper;
                        for (const key in valueMap) {
                            if (valueMap[key]) {
                                this.form.participantObj.oldParticipant = valueMap[key];
                                this.form.participantObj.participant = {
                                    type: key,
                                    value: valueMap[key].map((item) => item.oid || item)
                                };
                                if (oper.includes('IN')) {
                                    this.$nextTick(() => {
                                        if (this.$refs.famParticipantSelect) {
                                            this.$refs.famParticipantSelect.selectType = key;
                                        }
                                    });
                                }
                                break;
                            }
                        }
                    }
                }
                if (type === TYPEMAP['object']) {
                    this.$set(this.form, 'objectConfig', config?.split(',') || []);
                }
                this.addedTableData = groovyScriptVoList || [];
                this.checkRowNames = groovyScriptVoList.map((item) => item.name);
            },
            getLimitList() {
                this.$famHttp({
                    url: '/fam/type/component/enumDataList',
                    params: {
                        realType: 'erd.cloud.core.base.access.AccessPermission'
                    },
                    method: 'post'
                }).then(({ data }) => {
                    this.limitConfigList = data;
                });
            },
            filterTableData(data = {}) {
                this.dialogForm.appName = data.selected?.appName;
                this.pagination.pageIndex = 1;
                this.getGroovyData();
            },
            getGroovyData() {
                this.$famHttp({
                    url: '/common/groovy/page',
                    method: 'POST',
                    headers: {
                        'App-Name': 'ALL'
                    },
                    data: {
                        pageIndex: this.pagination.pageIndex,
                        pageSize: this.pagination.pageSize,
                        appName: this.dialogForm.appName,
                        groovyType: 'menuValidatorFilter',
                        searchKey: this.dialogForm.searchKey,
                        serviceName: this.dialogForm.serviceName,
                        enabled: 1
                    }
                })
                    .then((resp) => {
                        if (resp.data) {
                            const result = resp.data.records || [];
                            this.pagination.total = Number(resp.data.total);
                            this.groovyTableData = result.map((item) => {
                                return {
                                    ...item,
                                    id: item.id,
                                    displayName: item.displayName,
                                    name: item.name,
                                    description: item.descriptionI18nJson?.value || '',
                                    functionName: item.functionName,
                                    versionStr: item.versionStr,
                                    createTime: item.createTime,
                                    vid: item.vid
                                };
                            });
                            this.$nextTick(() => {
                                const groovyTable = this.$refs.groovyTable?.$table;
                                if (groovyTable) {
                                    const checkRadioObj = this.groovyTableData.find((item) => {
                                        return item.id === this.checkRowKey || this.checkRowNames.includes(item.name);
                                    });
                                    if (checkRadioObj) {
                                        groovyTable.setRadioRow(checkRadioObj);
                                    } else {
                                        groovyTable.clearRadioRow();
                                        groovyTable.clearRadioReserve();
                                    }
                                }
                            });
                        }
                    })
                    .catch(() => {});
            },
            changeTypeName(data) {
                const firstItem = data || null;
                if (firstItem) {
                    this.$set(this.form, 'type', firstItem?.type);
                    this.$set(this.form, 'name', firstItem?.beanName);
                    this.$set(this.form, 'typeName', firstItem?.typeName);
                } else {
                    this.form.type = '';
                    this.form.name = '';
                    this.form.typeName = '';
                }
            },
            onAddScript() {
                this.onDialogOpen();
            },
            onDialogOpen() {
                this.pagination.pageIndex = 1;
                this.getGroovyData();
                this.dialogVisible = true;
            },
            onDialogClose() {
                this.dialogVisible = false;
            },
            onSizeChange(pageSize) {
                this.pagination.pageIndex = 1;
                this.pagination.pageSize = pageSize;
                this.getGroovyData();
            },
            onPageChange(pageIndex) {
                this.pagination.pageIndex = pageIndex;
                this.getGroovyData();
            },
            onSubmit() {
                const groovyTable = this.$refs.groovyTable?.$table;
                if (groovyTable) {
                    const checkedRadioRow = groovyTable.getRadioRecord();
                    if (checkedRadioRow) {
                        this.checkRowKey = checkedRadioRow.id;
                        this.addedTableData = [checkedRadioRow];
                        this.onDialogClose();
                    } else {
                        this.$message.warning(this.i18nMappingObj['addLeastOneTip']);
                    }
                }
            },
            onRadioChange({ row }) {
                this.checkRowKey = row.id;
            },
            onRemove() {
                this.addedTableData = [];
                this.checkRowKey = '';
                this.checkRowNames = [];
                this.setTableLoading();
            },
            changeRadio(field) {
                const fieldVal = this.form[field];
                if (field === 'succeedSet') {
                    if (fieldVal === 'ENABLED') {
                        this.$set(this.form, 'failSet', 'HIDDEN');
                    } else {
                        this.$set(this.form, 'failSet', 'ENABLED');
                    }
                } else {
                    if (fieldVal === 'ENABLED') {
                        this.$set(this.form, 'succeedSet', 'HIDDEN');
                    } else {
                        this.$set(this.form, 'succeedSet', 'ENABLED');
                    }
                }
            },
            setTableLoading() {
                this.addedTableLoading = true;
                setTimeout(() => {
                    this.addedTableLoading = false;
                }, 200);
            },
            submit() {
                const { validatorForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    validatorForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 脚本过滤器
                                if (this.form.type === TYPEMAP['groovy'] && !this.addedTableData.length) {
                                    reject();
                                    return this.$message.warning(this.i18nMappingObj['addLeastOneTip']);
                                }
                                const ruleEngineData = this.$refs?.ruleEngine?.getRuleEngineParams();
                                if (this.form.type === TYPEMAP['rule'] && _.isEmpty(ruleEngineData)) {
                                    reject();
                                    ruleEngineData != undefined
                                        ? this.$message.warning(this.i18nMappingObj['addLeastOneTip'])
                                        : '';
                                    return;
                                }
                                if (this.form.type === TYPEMAP['groovy']) {
                                    this.form.config = this.addedTableData[0]?.oid || '';
                                }
                                if (this.form.type === TYPEMAP['object']) {
                                    this.form.config = this.form?.objectConfig.join(',');
                                }

                                let participantData;
                                if (this.form.type === TYPEMAP['participantRule']) {
                                    let participant = ErdcKit.deepClone(this.form.participantObj.participant);
                                    if (Array.isArray(participant.value)) {
                                        participant.value = participant.value.map((item) => item.oid || item).join();
                                    }
                                    participantData = [
                                        {
                                            attrRawList: [
                                                {
                                                    attrName: 'logicalOperator',
                                                    value: 'AND'
                                                },
                                                {
                                                    attrName: 'sortOrder',
                                                    value: 0
                                                },
                                                {
                                                    attrName: 'isCondition',
                                                    value: 1
                                                },
                                                {
                                                    attrName: 'attrName',
                                                    value: `${this.buttonOid}#currentLoginUser`
                                                },
                                                {
                                                    attrName: 'oper',
                                                    value: this.form.participantObj.condition
                                                },
                                                {
                                                    attrName: 'value1',
                                                    value: participant
                                                }
                                            ],
                                            className: 'erd.cloud.foundation.core.tableview.entity.RuleCondition'
                                        }
                                    ];
                                }
                                resolve({
                                    formData: this.form,
                                    addedTableData: this.addedTableData,
                                    ruleEngineData,
                                    participantData
                                });
                            } else {
                                reject();
                            }
                        })
                        .catch(reject);
                });
            },
            onConfigCustom() {
                this.configVisible = true;
            },
            onSubmitConfig() {
                this.$refs.codeFilter
                    .submit()
                    .then((data) => {
                        this.$set(this.form, 'config', JSON.stringify(data || {}));
                    })
                    .finally(() => {
                        this.configVisible = false;
                    });
            },
            onConditionChange(condition) {
                const participantType = condition.includes('IN') ? 'ROLE' : 'USER';
                this.form.participantObj.participant = {
                    type: participantType,
                    value: []
                };
                this.form.participantObj.oldParticipant = [];
                this.$refs.famParticipantSelect.handleCommand(participantType);
                this.$refs.famParticipantSelect.visiblePopover = false;
            }
        }
    };
});
