define(['erdcloud.kit', 'underscore'], function () {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');

    return {
        /*html*/
        template: `
            <div
                id="log-form-content"
                class="log-form-content"
            >
                <FamDynamicForm
                    ref="dynamicForm"
                    :form.sync="form"
                    :data="dataList"
                    :readonly="readonly"
                    label-position="right"
                ></FamDynamicForm>
            </div>
        `,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            // 是否只读
            readonly: {
                type: Boolean,
                default: false
            },
            // 流程实例oid
            oid: {
                type: String,
                default: ''
            },
            // 接口oid
            interfaceRef: {
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
                    '流程实例Id',
                    '流程定义key',
                    '流程名称',
                    '任务key值',
                    '任务Id',
                    '接口路径',
                    '状态',
                    '调用方式',
                    '接口类型',
                    '操作用户',
                    '调用日期',
                    '处理时间',
                    '参数',
                    '结果数据',
                    '查看流程实例详情失败'
                ]),
                form: {}
            };
        },
        computed: {
            // 按钮组合表单数据
            dataList() {
                return [
                    {
                        field: 'procInstRef',
                        component: 'erd-input',
                        label: this.i18nMappingObj['流程实例Id'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['流程实例Id'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'processDefinitionKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['流程定义key'],
                        required: true,
                        disabled: false,
                        hidden: true,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['流程定义key'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'processName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['流程名称'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['流程实例名称'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'taskKey',
                        component: 'erd-input',
                        label: this.i18nMappingObj['任务key值'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['任务key值'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'taskId',
                        component: 'erd-input',
                        label: this.i18nMappingObj['任务Id'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['任务Id'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'interfacePath',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口路径'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            type: 'textarea',
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口路径'])
                                : ''
                        },
                        listeners: {
                            dblclick: (value) => {
                                this.copyContent(value);
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'status',
                        component: 'erd-input',
                        label: this.i18nMappingObj['状态'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['状态'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'syncFlag',
                        component: 'erd-input',
                        label: this.i18nMappingObj['调用方式'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['调用方式'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'interfaceType',
                        component: 'erd-input',
                        label: this.i18nMappingObj['接口类型'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['接口类型'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'operatorUserRef',
                        component: 'erd-input',
                        label: this.i18nMappingObj['操作用户'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['操作用户'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'invokeTime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['调用日期'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['调用日期'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'runtime',
                        component: 'erd-input',
                        label: this.i18nMappingObj['处理时间'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['处理时间'])
                                : ''
                        },
                        col: 24
                    },
                    {
                        field: 'params',
                        component: 'erd-input',
                        label: this.i18nMappingObj['参数'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            type: 'textarea',
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['参数'])
                                : ''
                        },
                        listeners: {
                            dblclick: (value) => {
                                this.copyContent(value);
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'resultData',
                        component: 'erd-input',
                        label: this.i18nMappingObj['结果数据'],
                        required: true,
                        disabled: false,
                        hidden: false,
                        props: {
                            type: 'textarea',
                            maxlength: 64,
                            clearable: true,
                            disabled: false,
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['结果数据'])
                                : ''
                        },
                        listeners: {
                            dblclick: (value) => {
                                this.copyContent(value);
                            }
                        },
                        col: 24
                    }
                ];
            },
            // 能否查询详情
            checkDetails() {
                return !!this.oid && !!this.interfaceRef;
            },
            // 接口分类列表
            interfaceClassList() {
                if (!(this.readonly && this.oid)) {
                    return [
                        {
                            label: this.i18nMappingObj['业务接口'],
                            value: 'business'
                        },
                        {
                            label: this.i18nMappingObj['处理接口'],
                            value: 'handleInterface'
                        }
                    ];
                } else {
                    return [
                        {
                            label: this.i18nMappingObj['业务接口'],
                            value: 'business'
                        },
                        {
                            label: this.i18nMappingObj['处理接口'],
                            value: 'handleInterface'
                        },
                        {
                            label: this.i18nMappingObj['用户'],
                            value: 'user'
                        },
                        {
                            label: this.i18nMappingObj['角色'],
                            value: 'role'
                        },
                        {
                            label: this.i18nMappingObj['生命周期'],
                            value: 'lifecircle'
                        },
                        {
                            label: this.i18nMappingObj['用户'],
                            value: 'userById'
                        }
                    ];
                }
            }
        },
        watch: {
            checkDetails: {
                handler: function (checkDetails) {
                    checkDetails && this.getDetails();
                },
                immediate: true
            }
        },
        methods: {
            // 获取详情
            getDetails() {
                Promise.all([this.getsProcessInstanceDetails(), this.getInterfaceDetails()])
                    .then((resp) => {
                        let [pDetails = {}, iDetails = {}] = resp || [];
                        if (pDetails.success && iDetails.success) {
                            ({ data: pDetails } = pDetails || {});
                            ({ data: iDetails } = iDetails || {});
                            pDetails = this.initRawData({ source: 'pDetails', rawData: pDetails?.rawData || {} });
                            iDetails = this.initRawData({ source: 'iDetails', rawData: iDetails?.rawData || {} });
                            this.form = { ...iDetails, ...pDetails };
                        } else {
                            this.$message.error(this.i18nMappingObj['查看流程实例详情失败']);
                        }
                    })
                    .catch((error) => {
                        this.$message.error(this.i18nMappingObj['查看流程实例详情失败']);
                    });
            },
            // 组装数据
            initRawData({ source, rawData = {} }) {
                let obj = {};
                _.each(rawData, (value, key) => {
                    if (key === 'procInstRef') {
                        obj[key] = value.value.id || value?.oid || '';
                    } else {
                        obj[key] = value?.displayName || value?.oid || '';
                    }
                });
                return { ...obj, [source + 'RawData']: rawData };
            },
            // 获取流程实例详情
            getsProcessInstanceDetails() {
                return this.$famHttp({
                    url: '/bpm/attr',
                    method: 'GET',
                    params: {
                        oid: this.oid
                    }
                });
            },
            // 获取接口详情
            getInterfaceDetails() {
                return this.$famHttp({
                    url: '/bpm/attr',
                    method: 'GET',
                    params: {
                        oid: this.interfaceRef
                    }
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
                            res = await this.operInterfaceObj({ form });
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
                        let { data } = err;
                        if (data.success === false) {
                            this.$message.error(data.message);
                            err.valid = data.success;
                        }
                        callback({ valid: err.valid });
                    });
            },
            // 创建更新接口对象
            operInterfaceObj({ form }) {
                let data = {},
                    associatedAttrList = ['name', 'description'];
                data.relationList = [
                    {
                        attrRawList: _.filter(form, (item) => !associatedAttrList.includes(item.attrName)),
                        className: 'erd.cloud.bpm.bussiness.entity.BusinessInterface'
                    }
                ];
                data.associationField = 'masterRef';
                data.className = 'erd.cloud.bpm.bussiness.entity.BusinessInterfaceMaster';
                data.attrRawList = _.filter(form, (item) => associatedAttrList.includes(item.attrName));
                // data.attrRawList = formattForm(form);
                // this.buttonInfo.type === 'edit' && (data.attrRawList = _.filter(data.attrRawList, item => filterList.indexOf(item.attrName) === -1));
                // this.buttonInfo.type === 'edit' && (data.action = 'UPDATE');
                // this.buttonInfo.type === 'edit' && (data.oid = this.buttonInfo.singleButton.oid);
                return this.$famHttp({
                    url: this.buttonInfo.type === 'create' ? '/fam/create' : '/fam/update',
                    // url: 'http://192.168.12.208:8016/create',
                    data,
                    method: 'post'
                });
            },
            // 复制内容
            copyContent(data) {
                const target = document.createElement('textarea');
                target.value = data.currentTarget.innerText;
                document.body.appendChild(target)
                target.select();
                document.execCommand('copy');
                target.remove();
                this.$message.success('复制成功');
            }
        }
    };
});
