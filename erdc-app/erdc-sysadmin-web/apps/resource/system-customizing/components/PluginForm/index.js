define(['text!' + ELMP.resource('system-customizing/components/PluginForm/index.html')], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            AddClassForm: FamKit.asyncComponent(ELMP.resource('system-customizing/components/AddClassForm/index.js'))
        },
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomEngineering/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'Confirm',
                    'Cancel',
                    'typeInformation',
                    'noteUnique',
                    'add',
                    'operation',
                    'addClass',
                    'noteUnique',
                    'edit',
                    'copy',
                    'delete',
                    'projectName',
                    'projectNamePlaceholder',
                    'ownService',
                    'pleaseSelectService',
                    'engineerType',
                    'pleaseProjectType',
                    'className',
                    'displayName',
                    'parentClassName',
                    'interface',
                    'tenantPolicy',
                    'deleteOrNot',
                    'classNameUnique',
                    'appName',
                    'pleaseEnterProjectAndApplication',
                    'pleaseEnterProjectName',
                    'projectNameTooltip',
                    'pleaseSelectApp'
                ]),
                formData: {
                    serviceRef: ''
                },
                tableData: [],
                addClassVisible: false,
                modelData: {},
                type: 'create',
                service: '',
                erdcloud: 'erdcloud-',
                plugin: '-plugin'
            };
        },
        computed: {
            buttons() {
                return {
                    displayName: this.i18nMappingObj.operation,
                    visible: false,
                    children: [
                        {
                            displayName: this.i18nMappingObj.edit,
                            name: 'edit'
                        },
                        {
                            displayName: this.i18nMappingObj.copy,
                            name: 'copy'
                        },
                        {
                            displayName: this.i18nMappingObj.delete,
                            name: 'delete'
                        }
                    ]
                };
            },
            dataConfig() {
                return [
                    {
                        field: 'type',
                        component: 'custom-select',
                        label: this.i18nMappingObj.engineerType,
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: false,
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value) {
                                        return callback(
                                            new Error(`${this.i18n['pleaseSelect']}${this.i18n['engineerType']}`)
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: 'change'
                            }
                        ],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseProjectType,
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    url: '/platform/enumDataList',
                                    method: 'post',
                                    params: {
                                        realType: 'erd.cloud.core.plugin.domain.enums.PluginType'
                                    },
                                    viewProperty: 'value',
                                    valueProperty: 'name'
                                }
                            }
                        },
                        listeners: {
                            callback: () => {
                                // 切换清空服务或者应用
                                this.service = '';
                                this.formData.serviceRef && this.$set(this.formData, 'serviceRef', '');
                                this.formData.appName && this.$set(this.formData, 'appName', '');
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'serviceRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj.ownService,
                        disabled: false,
                        hidden: this.isServieEnginerring,
                        required: true,
                        readonly: false,
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value) {
                                        return callback(
                                            new Error(`${this.i18n['pleaseSelect']}${this.i18n['ownService']}`)
                                        );
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: 'change'
                            }
                        ],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseSelectService,
                            row: {
                                componentName: 'virtual-select',
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'oid', // 显示value的key
                                requestConfig: {
                                    url: '/platform/service/getAllServiceInfoVo'
                                }
                            }
                        },
                        listeners: {
                            callback: (data) => {
                                const { selected } = data;
                                this.service = selected?.shortName || '';
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: this.i18nMappingObj.appName,
                        disabled: false,
                        hidden: !this.isServieEnginerring,
                        required: true,
                        readonly: false,
                        validators: [], // 不需要
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseSelectApp,
                            row: {
                                componentName: 'virtual-select',
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'identifierNo', // 显示value的key
                                requestConfig: {
                                    url: '/platform/application/getCurrentTenantIdApplication'
                                }
                            }
                        },
                        listeners: {
                            callback: () => {
                                this.service = this.formData?.name || '';
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'slot',
                        label: this.i18nMappingObj.projectName,
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: false,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    var reg = /[^a-z]/g;
                                    if (!value) {
                                        callback(new Error(this.i18nMappingObj.pleaseEnterProjectName));
                                    } else if (value.match(reg)) {
                                        callback(new Error(this.i18nMappingObj.projectNameTooltip));
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: ['blur', 'change']
                            }
                        ],
                        props: {
                            name: 'nameslot',
                            clearable: true,
                            placeholder: this.i18nMappingObj.projectNamePlaceholder
                        },
                        col: 24
                    },
                    {
                        field: 'typeInformation',
                        label: '',
                        component: 'slot',
                        defaultValue: this.shareDefault,
                        props: {
                            name: 'type-information'
                        },
                        col: 24
                    }
                ];
            },
            column() {
                return [
                    {
                        title: ' ',
                        type: 'seq',
                        algin: 'center',
                        width: '32'
                    },
                    {
                        prop: 'className',
                        title: this.i18nMappingObj.className,
                        width: '200'
                    },
                    {
                        prop: 'displayName',
                        title: this.i18nMappingObj.displayName
                    },
                    {
                        prop: 'parentClassName',
                        title: this.i18nMappingObj.parentClassName,
                        width: '200'
                    },
                    {
                        prop: 'interfaceList',
                        title: this.i18nMappingObj.interface,
                        width: '200'
                    },
                    {
                        prop: 'tenantPolicy',
                        title: this.i18nMappingObj.tenantPolicy,
                        width: '100'
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj.operation,
                        width: '72'
                    }
                ];
            },
            isServieEnginerring() {
                return this.formData.type === 'SERVER';
            }
        },
        methods: {
            visibleChange(isShow, items) {
                this.$set(items, 'visible', isShow);
            },
            tenantPolicy(value) {
                const obj = {
                    MANDATORY: '强制隔离',
                    WEAKER: '弱隔离',
                    IGNORE: '不隔离'
                };
                return obj[value] || '';
            },
            // 增加
            onAdd() {
                if (!this.isServieEnginerring && !this.formData.serviceRef) {
                    return this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.pleaseSelectService,
                        showClose: true
                    });
                }
                if (this.isServieEnginerring && (!this.formData.name || !this.formData.appName)) {
                    return this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj.pleaseEnterProjectAndApplication,
                        showClose: true
                    });
                }
                if (this.isServieEnginerring) {
                    this.service = this.formData?.name || '';
                }
                this.type = 'create';
                this.modelData = null;
                this.addClassVisible = true;
            },
            onCommand(name, data) {
                this?.[name]?.(data);
            },
            edit(data) {
                const { row } = data;
                this.type = 'update';
                this.modelData = FamKit.deepClone(row);
                this.addClassVisible = true;
            },
            copy(data) {
                const { row } = data;
                this.type = 'copy';
                this.modelData = FamKit.deepClone(row);
                this.addClassVisible = true;
            },
            delete(data) {
                const { $rowIndex } = data;
                this.$confirm(this.i18nMappingObj.deleteOrNot, this.i18nMappingObj.confirmDel, {
                    confirmButtonText: this.i18nMappingObj.Confirm,
                    cancelButtonText: this.i18nMappingObj.Cancel,
                    type: 'warning'
                }).then(() => {
                    this.tableData.splice($rowIndex, 1);
                });
            },
            onAddClass() {
                const { addClassForm } = this.$refs;
                addClassForm.submit().then((data) => {
                    if (this.type === 'create' || this.type === 'copy') {
                        const newData = this.tableData.find((item) => item.className === data.className);
                        if (newData) {
                            return this.$message({
                                type: 'error',
                                message: this.i18nMappingObj.classNameUnique,
                                showClose: true
                            });
                        }
                        delete data._X_ROW_KEY;
                        delete data.visible;
                        this.tableData = [data, ...this.tableData];
                    } else {
                        this.tableData = this.tableData.map((item) => {
                            if (item.className === data.className) {
                                return data;
                            }
                            return item;
                        });
                    }
                    this.addClassVisible = false;
                });
            },
            submit() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                const typeList = this.tableData.map((item) => {
                                    return {
                                        className: item.className,
                                        displayName: item.displayName,
                                        icon: item.icon,
                                        parentClassName: item.parentClassName,
                                        interfaceList: item.interfaceList,
                                        tenantPolicy: item.tenantPolicy
                                    };
                                });
                                // 为了处理隐藏的属性，不保存已隐藏的数据
                                const formData = dynamicForm.serializeEditableAttr();
                                let data = {};
                                formData.forEach((item) => {
                                    data[item.attrName] = item.value;
                                    if (item.attrName === 'name') {
                                        data[item.attrName] = this.isServieEnginerring
                                            ? `${this.erdcloud}${item.value}`
                                            : `${this.erdcloud}${item.value}${this.plugin}`;
                                    }
                                    if (item.attrName === 'className') {
                                        data[item.attrName] = item.value?.split('-')?.join('');
                                    }
                                });
                                resolve({
                                    ...data,
                                    typeList
                                });
                            } else {
                                reject();
                            }
                        })
                        .catch(reject);
                });
            }
        }
    };
});
