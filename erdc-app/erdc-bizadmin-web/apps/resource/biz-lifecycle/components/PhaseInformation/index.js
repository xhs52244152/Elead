/*
    类型基本信息配置
    先引用 kit组件
    LifecycleForm: ErdcKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleForm/index.js')), // 类型基本信息配置


    <lifecycle-form
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-form>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/PhaseInformation/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('biz-lifecycle/components/PhaseInformation/style.css')
], function (template, fieldTypeMapping) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: false
            },
            formData: {
                tyep: Object,
                default: () => {
                    return {};
                }
            },
            phaseOid: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'create'
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            ParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js')),
            AssociatedProcess: ErdcKit.asyncComponent(
                ELMP.resource('biz-lifecycle/components/AssociatedProcess/index.js')
            )
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/PhaseInformation/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    currentState: this.getI18nByKey('当前状态'),
                    stateCondition: this.getI18nByKey('状态流转条件'),
                    stateTooltip: this.getI18nByKey('状态流转提示'),
                    accessControl: this.getI18nByKey('权限控制'),
                    associatedProcess: this.getI18nByKey('关联流程'),
                    addMembers: this.getI18nByKey('添加成员'),
                    remove: this.getI18nByKey('移除'),
                    targetState: this.getI18nByKey('目标状态'),
                    member: this.getI18nByKey('成员'),
                    operation: this.getI18nByKey('操作'),
                    failedListHeade: this.getI18nByKey('获取权限列表表头失败'),
                    user: this.getI18nByKey('用户'),
                    selected: this.getI18nByKey('已选择'),
                    confirmRemove: this.getI18nByKey('确认移除'),
                    processName: this.getI18nByKey('processName'),
                    selectProcess: this.getI18nByKey('selectProcess')
                },
                stateUnfold: true,
                aclUnfold: true,
                processUnfold: true,
                searchParticipantVal: '',
                showParticipantType: ['ROLE'],
                selectRole: [],
                stateName: '',
                associatedProcessVisible: false,
                processName: [],
                queryScope: 'fullTenant'
                // 阶段信息表头
                // phaseEnumData: [],
                // aclEnumData: []
            };
        },
        watch: {
            phaseOid: {
                handler() {
                    this.processName = this.formData.processes.filter((item) => item.stateRef === this.phaseOid);

                    // 切换状态时, 清空已选角色
                    this.selectRole = [];
                    this.searchParticipantVal = '';
                },
                immediate: true
            }
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
            columnState() {
                let columnState = [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'displayName',
                        title: this.i18nMappingObj['targetState'],
                        minWidth: '160',
                        width: '160'
                    }
                ];
                this.phaseEnumData?.forEach((item) => {
                    let obj = {
                        prop: item.value,
                        title: item.name,
                        minWidth: '160',
                        ...item
                    };
                    if (item.value === 'REWORK') {
                        obj.tips = '编辑业务对象属性值';
                    }
                    columnState.push(obj);
                });
                return columnState;
            },
            columnAcl() {
                let columnAcl = [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'displayName',
                        title: this.i18nMappingObj['member'],
                        minWidth: '160',
                        width: '160'
                    }
                ];
                this.aclEnumData?.forEach((item) => {
                    let obj = {
                        prop: `${item.value}`,
                        title: item.description,
                        minWidth: '160',
                        ...item
                    };
                    if (item.name === 'MODIFY') {
                        obj.tips = '编辑业务对象属性值';
                    }
                    if (item.name === 'MODIFY_CONTENT') {
                        obj.tips = '修改业务对象关联的实体文件';
                    }
                    columnAcl.push(obj);
                });
                if (!(this.type == 'check' || this.type == 'checkHistory')) {
                    columnAcl.push({
                        prop: 'oper',
                        title: this.i18nMappingObj['operation'],
                        minWidth: '80'
                    });
                }
                return columnAcl;
            },
            aclTableData: {
                get() {
                    const aclSpecs = (this.formData?.aclSpecs || []).find(item => item.stateRef === this.phaseOid);
                    return aclSpecs?.accessRoleList?.accessRoleInfoList || [];
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            stateTableData: {
                get() {
                    let stateTableData = [];
                    this.formData?.lifecycleStates &&
                        this.formData?.lifecycleStates.forEach((item) => {
                            if (item.oid == this.phaseOid) {
                                this.stateName = item.displayName || '';
                            }
                        });
                    this.formData?.stateTableData &&
                        this.formData?.stateTableData.forEach((item) => {
                            if (item.roleBRef == this.phaseOid) {
                                stateTableData = item.lifecycleStates || [];
                            }
                        });

                    return stateTableData;
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            phaseFormData: {
                get() {
                    return this.formData || {};
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            phaseEnumData: {
                get() {
                    return this.formData.phaseEnumData || [];
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            aclEnumData: {
                get() {
                    return this.formData.aclEnumData || [];
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            processData: {
                get() {
                    return this.formData.processes || [];
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            style() {
                return this.type != 'check' && this.type != 'checkHistory' ? 'padding-bottom: 70px !important' : '';
            }
        },
        methods: {
            // 获取枚举
            getEnumData(Enum, cb) {
                const enumData = new FormData();
                enumData.append('realType', Enum);
                // 获取枚举默认配置
                let config = this.fnComponentHandle('enum-select', true)?.componentConfigs || {};
                config['data'] = enumData;
                this.$famHttp(config)
                    .then((resp) => {
                        let resultData = resp?.data || [];
                        resultData.forEach((item) => {
                            item.slotName = `column:default:${item.value}`;
                        });
                        cb && cb(resultData);
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // });
                    });
            },
            // 获取权限表头
            getAclSpec() {
                this.$famHttp({
                    url: '/fam/lifecycle/aclSpec/all',
                    method: 'GET'
                })
                    .then((resp) => {
                        let { data } = resp || [];
                        data.forEach((item) => {
                            item.slotName = `column:default:${item.value}`;
                            this.aclEnumMap[item.name] = item.value;
                        });
                        this.aclEnumData = data;
                        this.phaseFormData.aclEnumEnum = data;
                        this.phaseFormData.aclEnumMap = this.aclEnumMap;
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['failedListHeade']
                        // });
                    });
            },
            // 设置表格列样式
            cellClassName({ row, column }) {
                const columnArr = ['revise', 'revision', 'change', 'setstate'];
                if (columnArr.includes(column.property)) {
                    return 'cell-center';
                } else {
                    return '';
                }
            },
            // 设置头部样式
            headerCellClassName({ row, column }) {
                const columnArr = ['revise', 'revision', 'change', 'setstate'];
                if (columnArr.includes(column.property)) {
                    return 'header-center';
                } else {
                    return '';
                }
            },
            // 添加成员
            addUser() {
                if(_.isEmpty(this.selectRole)) {
                    return this.$message({
                        type: 'warning',
                        message: this.i18n.pleaseSelectMember
                    })
                }
                const selectOidArr = this.aclTableData.map((item) => item.oid);
                const aclEnumArr = this.aclEnumData.map((item) => item.displayName);
                let repeatRole = [];
                this.selectRole.forEach((item) => {
                    if (!selectOidArr.includes(item.oid)) {
                        this.$set(item, 'displayName', item.displayName);
                        this.$set(item, 'roleKey', item.identifierNo);
                        aclEnumArr.forEach((key) => {
                            this.$set(item, key, false);
                        });
                        this.aclTableData.push(item);
                    } else {
                        repeatRole.push(item.displayName);
                    }
                });
                if (repeatRole.length) {
                    this.$message({
                        type: 'warning',
                        message: `${this.i18nMappingObj['user']}【${repeatRole.join('、')}】${
                            this.i18nMappingObj['selected']
                        }`
                    });
                }
                this.searchParticipantVal = '';
                this.selectRole = [];
                this.$refs.ParticipantSelect.clearInput();
            },
            onChange(values, data) {
                this.selectRole = data;
            },
            // 移除
            onRemove(data) {
                const { row } = data;
                this.$confirm(this.i18nMappingObj['confirmRemove'], this.i18nMappingObj['confirmRemove'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then((_) => {
                    this.aclTableData.forEach((item, index) => {
                        if (item.roleKey === row.roleKey) {
                            this.aclTableData.splice(index, 1);
                        }
                    });
                });
            },
            onChangeAcl(value, data) {
                const { row, column } = data || {};
                if (value) {
                    let aclEnum = this.aclEnumData.map((item) => {
                        return `${item.value}`;
                    });
                    if (column.property == '-1') {
                        _.keys(row).forEach((key) => {
                            if (aclEnum.includes(key) && key != '-1') {
                                this.$set(row, key, false);
                            }
                        });
                    } else {
                        this.$set(row, '-1', false);
                    }
                }
            },
            onChangePhaseState(value, data) {
                const { row, column } = data;
                let flag = true;
                this.phaseEnumData.forEach((item) => {
                    if (item.value == column.property && item.extraInfo?.isCheckbox == 'true') {
                        flag = false;
                    }
                });
                let radioName = '';
                if (flag) {
                    // 设置单选
                    if (value) {
                        radioName = column.property;
                        this.stateTableData.forEach((item) => {
                            if (item.oid != row.oid) {
                                this.$set(item, column.property, false);
                            }
                        });
                    }
                }

                if (!this.phaseFormData.stateSuccessions) {
                    this.phaseFormData.stateSuccessions = [];
                }
                let stateSuccessions = JSON.parse(JSON.stringify(this.phaseFormData.stateSuccessions));
                let hasState = false;
                let index;
                // 判断当前操作的目标是否已经存在
                stateSuccessions.forEach((item, idx) => {
                    if (item.name == column.property && item.roleBRef == row.oid && item.roleARef == this.phaseOid) {
                        hasState = true;
                        index = idx;
                    }
                });

                if (value && !hasState) {
                    // 当前操作目标是否为单选如果是单选，则需要将同阶段的相同操作清除掉
                    if (flag) {
                        this.phaseFormData.stateSuccessions = this.phaseFormData.stateSuccessions.filter((item) => {
                            return item.name != radioName || this.phaseOid != item.roleARef;
                        });
                    }
                    // 添加当前选中
                    this.phaseFormData.stateSuccessions.push({
                        name: column.property,
                        roleBRef: row.oid,
                        roleARef: this.phaseOid
                    });
                }
                if (!value && hasState) {
                    this.phaseFormData.stateSuccessions.splice(index, 1);
                }
            },
            // 选择流程
            selectProcess() {
                this.associatedProcessVisible = true;
            },
            // 添加关联流程
            addAssociatedProcess(data) {
                // TODO 关联多个流程
                // this.processName = data.map((item) => item.name);
                // const phaseOidArr = this.processData.map((item) => item.processRef);
                // data.forEach((item) => {
                //     const processObj = {
                //         stateRef: this.phaseOid,
                //         processRef: item.oid || item.processRef
                //     };
                //     if (!phaseOidArr.includes(processObj.processRef)) {
                //         this.processData.push(processObj);
                //     }
                // });
                this.processName = _.isArray(data) ? data : [data];
                const phaseOidArr = this.processData.map((item) => item.stateRef);
                if (phaseOidArr.includes(this.phaseOid)) {
                    this.processData.forEach((item) => {
                        if (item.stateRef === this.phaseOid) {
                            this.$set(item, 'processRef', data.oid);
                            this.$set(item, 'name', data.name);
                            this.$set(item, 'engineModelKey', data.engineModelKey);
                        }
                    });
                } else {
                    this.processData.push({
                        stateRef: this.phaseOid,
                        processRef: data.oid,
                        name: data.name,
                        engineModelKey: data.engineModelKey
                    });
                }
            },
            showDeleteButton(process) {
                this.$set(process, 'isShowDelete', true);
            },
            hideDeleteButton(process) {
                this.$set(process, 'isShowDelete', false);
            },
            deleteAssociatedProcess(process) {
                this.processName = _.filter(this.processName, (item) => item.stateRef !== process.stateRef);
                const target = _.find(this.processData, (item) => item.stateRef === process.stateRef);
                target && (target.engineModelKey = '');
            }
        }
    };
});
