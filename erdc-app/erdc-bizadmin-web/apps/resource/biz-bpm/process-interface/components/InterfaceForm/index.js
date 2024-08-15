define(['text!' + ELMP.resource('biz-bpm/process-interface/components/InterfaceForm/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            CheckerTree: ErdcKit.asyncComponent(ELMP.resource('system-operation-menu/components/CheckerTree/index.js'))
        },
        props: {
            // 是否只读
            readonly: {
                type: Boolean,
                default: false
            },
            // 编辑对象oid
            oid: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '接口分类',
                    '接口名称',
                    '接口类型',
                    '接口地址',
                    '分组',
                    '方法',
                    '请求方法',
                    'Dubbo版本',
                    '消息发送方式',
                    '调用方式',
                    '失败重试',
                    '重试间隔',
                    '接口参数',
                    '描述',
                    '业务接口',
                    '处理接口',
                    '用户',
                    '角色',
                    '生命周期',
                    '全部实例',
                    '全局一次',
                    '单一实例',
                    '同步',
                    '异步',
                    '失败重试格式不正确',
                    '重试间隔格式不正确',
                    '请输入正确的json数据',
                    'Dubbo接口',
                    '确定',
                    '取消',
                    '接口名称',
                    '显示名称'
                ]),
                form: {
                    interfaceCategory: 'BUSINESS',
                    interfaceType: 'DUBBO',
                    failureNumber: 5,
                    intervalTime: 10,
                    syncFlag: 'SYN',
                    address: '',
                    rpcInterface: ''
                },
                dialogVisible: false,
                // 服务名称
                shortName: '',
                // dubbo接口数据
                interfaceList: [],
                addTable: [],
                // 分页
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                }
            };
        },
        computed: {
            // 按钮组合表单数据
            fromList() {
                const _this = this;
                return [
                    {
                        field: 'interfaceCategory',
                        component: 'custom-select',
                        label: this.i18nMappingObj['接口分类'],
                        required: !this.readonly,
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['接口分类'])
                                : '',
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.interfaceClassList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: () => {
                                _this.form.rpcInterface = '';
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口名称'],
                        required: !this.readonly,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口名称'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'interfaceType',
                        component: 'FamRadio',
                        label: this.i18nMappingObj['接口类型'],
                        disabled: false,
                        required: !this.readonly,
                        hidden: this.form.interfaceCategory === 'HANDLE_INTERFACE',
                        props: {
                            type: 'radio',
                            options: this.interfaceTypeList
                        },
                        listeners: {
                            input: () => {
                                this.$set(this.form, 'rpcInterface', '');
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'dubboInterface',
                        label: this.i18nMappingObj['Dubbo接口'],
                        hidden: this.form.interfaceCategory !== 'BUSINESS' || this.form.interfaceType !== 'DUBBO',
                        slots: {
                            component: 'tableComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'rpcInterface',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口地址'],
                        required: !this.readonly,
                        disabled: this.form.interfaceCategory === 'BUSINESS' && this.form.interfaceType === 'DUBBO',
                        hidden: this.form.interfaceType === 'MQ',
                        props: {
                            maxlength: 256,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口地址'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'requestMethod',
                        component: 'custom-select',
                        label: this.i18nMappingObj['请求方法'],
                        required: !this.readonly,
                        disabled: false,
                        hidden:
                            this.form.interfaceCategory !== 'BUSINESS' ||
                            (this.form.interfaceCategory === 'BUSINESS' && this.form.interfaceType !== 'REST'),
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['请求方法'])
                                : '',
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.requestMethodList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'msgSendType',
                        component: 'custom-select',
                        label: this.i18nMappingObj['消息发送方式'],
                        required: !this.readonly,
                        disabled: false,
                        hidden: this.form.interfaceCategory === 'HANDLE_INTERFACE' || this.form.interfaceType !== 'MQ',
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['消息发送方式'])
                                : '',
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.msgSendTypeList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'syncFlag',
                        component: 'custom-select',
                        label: this.i18nMappingObj['调用方式'],
                        required: !this.readonly,
                        disabled: false,
                        hidden: this.form.interfaceCategory === 'BUSINESS' && this.form.interfaceType === 'MQ',
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['调用方式'])
                                : '',
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.syncFlagList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'failureNumber',
                        component: 'erd-input',
                        label: this.i18nMappingObj['失败重试'],
                        required: !this.readonly,
                        disabled: false,
                        hidden:
                            (this.form.interfaceCategory === 'BUSINESS' &&
                                (this.form.interfaceType === 'MQ' || this.form.syncFlag === 'SYN')) ||
                            (this.form.interfaceCategory === 'HANDLE_INTERFACE' && this.form.syncFlag === 'SYN'),
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!/^[0-9]\d*$/.test(value)) {
                                        return callback(new Error(this.i18nMappingObj['失败重试格式不正确']));
                                    }
                                    callback();
                                }
                            }
                        ],
                        props: {
                            maxlength: 128,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['失败重试'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'intervalTime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['重试间隔'],
                        required: !this.readonly,
                        disabled: false,
                        hidden:
                            (this.form.interfaceCategory === 'BUSINESS' &&
                                (this.form.interfaceType === 'MQ' || this.form.syncFlag === 'SYN')) ||
                            (this.form.interfaceCategory === 'HANDLE_INTERFACE' && this.form.syncFlag === 'SYN'),
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!/^[0-9]\d*$/.test(value)) {
                                        return callback(new Error(this.i18nMappingObj['重试间隔格式不正确']));
                                    }
                                    callback();
                                }
                            }
                        ],
                        props: {
                            maxlength: 128,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['重试间隔'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'appName',
                        component: 'custom-select',
                        label: this.i18n.application, // 所属应用
                        required: !this.readonly,
                        disabled: false,
                        hidden: false,
                        props: {
                            clearable: true,
                            multiple: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'identifierNo', // 显示value的key
                                referenceList: this.appList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'params',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口参数'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    try {
                                        if (_.isString(value) && value.trim()) {
                                            value = JSON.parse(value);
                                            if (typeof value === 'object' && value) {
                                                return callback();
                                            } else {
                                                return callback(new Error(this.i18nMappingObj['请输入正确的json数据']));
                                            }
                                        }
                                        return callback();
                                    } catch {
                                        return callback(new Error(this.i18nMappingObj['请输入正确的json数据']));
                                    }
                                }
                            }
                        ],
                        props: {
                            maxlength: 999999999,
                            type: 'textarea',
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口参数'])
                                : ' '
                        },
                        col: 24
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: this.i18nMappingObj['描述'],
                        required: false,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 500,
                            type: 'textarea',
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['描述'])
                                : ''
                        },
                        col: 24
                    }
                ];
            },
            // 接口分类列表
            interfaceClassList() {
                if (!(this.readonly && this.oid)) {
                    return [
                        {
                            label: this.i18nMappingObj['业务接口'],
                            value: 'BUSINESS'
                        },
                        {
                            label: this.i18nMappingObj['处理接口'],
                            value: 'HANDLE_INTERFACE'
                        }
                    ];
                } else {
                    return [
                        {
                            label: this.i18nMappingObj['业务接口'],
                            value: 'BUSINESS'
                        },
                        {
                            label: this.i18nMappingObj['处理接口'],
                            value: 'HANDLE_INTERFACE'
                        },
                        {
                            label: this.i18nMappingObj['用户'],
                            value: 'USER'
                        },
                        {
                            label: this.i18nMappingObj['角色'],
                            value: 'ROLE'
                        },
                        {
                            label: this.i18nMappingObj['生命周期'],
                            value: 'LIFECIRCLE'
                        },
                        {
                            label: this.i18nMappingObj['用户'],
                            value: 'USERBYID'
                        }
                    ];
                }
            },
            // 消息发送方式列表
            msgSendTypeList() {
                return [
                    { label: this.i18nMappingObj['全部实例'], value: 'EVERY_ONE' },
                    { label: this.i18nMappingObj['全局一次'], value: 'GLOBAL_ONCE' },
                    { label: this.i18nMappingObj['单一实例'], value: 'SERVICE_ONCE' }
                ];
            },
            // 请求方法列表
            requestMethodList() {
                return [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' }
                ];
            },
            // 调用方式列表
            syncFlagList() {
                return [
                    { label: this.i18nMappingObj['同步'], value: 'SYN' },
                    { label: this.i18nMappingObj['异步'], value: 'ASYNC' }
                ];
            },
            // 接口类型列表
            interfaceTypeList() {
                return [
                    { label: 'DUBBO', value: 'DUBBO' },
                    { label: 'REST', value: 'REST' },
                    { label: 'MQ', value: 'MQ' }
                ];
            },
            // 接口列表列头
            interfaceColumn() {
                return [
                    {
                        prop: '',
                        type: 'radio',
                        width: '40',
                        align: 'center'
                    },
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'beanName',
                        title: this.i18nMappingObj['接口名称'] // 接口名称
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj['显示名称'] // 显示名称
                    }
                ];
            },
            // 所属应用列表
            appList() {
                return this.$store?.state?.app?.appNames || [];
            }
        },
        watch: {
            oid: {
                handler: function (oid) {
                    oid && this.getInterfaceDetails({ oid });
                },
                immediate: true
            }
        },
        methods: {
            // 获取接口详情
            getInterfaceDetails(params) {
                this.$famHttp({
                    url: '/bpm/getByOid',
                    method: 'GET',
                    params
                }).then((resp) => {
                    let { success, data = {} } = resp || {};
                    if (success) {
                        !data.description && data?.master?.description && (data.description = data.master.description);
                        this.form = data;
                    }
                });
            },
            // 表单校验
            formVerification() {
                const { dynamicForm } = this.$refs,
                    { submit, serializeEditableAttr } = dynamicForm;
                return { submit, serializeEditableAttr };
            },
            // 增加Dubbo接口
            onNodeClick(treeItem) {
                this.shortName = treeItem?.shortName || '';
                this.getDubboByService();
            },
            // 根据服务获取接口
            getDubboByService() {
                if (!this.shortName) return;
                this.$famHttp({
                    url: `/bpm/common/dubboservices/${this.shortName}`,
                    method: 'POST',
                    data: {
                        ...this.pagination
                    }
                }).then((resp) => {
                    if (resp.success) {
                        const { records, pageIndex, pageSize, total } = resp?.data || {};
                        this.interfaceList = records || [];
                        this.pagination.pageIndex = pageIndex || 1;
                        this.pagination.pageSize = pageSize || 20;
                        this.pagination.total = +total || 0;
                    }
                });
            },
            // 确定增加Dubbo接口
            confirmDialog() {
                const selectData = this.$refs['interfaceTable'].$table.getRadioRecord();
                this.form.address = this.shortName;
                this.form.rpcInterface = selectData.beanName;
                this.dialogVisible = false;
            },
            handlePageChange() {
                this.getDubboByService();
            },
            handleSizeChange() {
                this.getDubboByService();
            }
        }
    };
});
