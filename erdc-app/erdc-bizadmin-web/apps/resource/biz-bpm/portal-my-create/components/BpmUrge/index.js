define([
    'text!' + ELMP.resource('biz-bpm/portal-my-create/components/BpmUrge/template.html'),
    'erdcloud.kit',
    'underscore'
], function(template) {
    const _ = require('underscore');
    return {
        name: 'BpmUrge',
        template,
        props: {
            // 流程实例oid
            processInstanceOid: String,
            userOids: {
                type: Array,
                default() {
                    return [];
                }
            },
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-my-create/components/BpmUrge/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '内容',
                    '请输入内容',
                    '催办人员',
                    '通知方式',
                    'message',
                    '邮件'
                ]),
                form: {
                    userOids: [],
                    notifyWay: [],
                    content: ''
                },
                // 催办人员
                userOidsList: []
            };
        },
        computed: {
            // 表单数据
            dataList() {
                return [
                    {
                        field: 'userOids',
                        component: 'custom-select',
                        label: this.i18nMappingObj['催办人员'],
                        required: !this.readonly,
                        disabled: false,
                        hidden: false,
                        validators: [
                            {
                                trigger: ['change'],
                                validator: (rule, value, callback) => {
                                    if (!value.length) {
                                        return callback(
                                            new Error(
                                                _.isFunction(this.i18nMappingObj['组件提示'])
                                                    ? this.i18nMappingObj['组件提示'](
                                                    's',
                                                    this.i18nMappingObj['催办人员']
                                                    )
                                                    : this.i18nMappingObj['催办人员']
                                            )
                                        );
                                    }
                                    callback();
                                }
                            }
                        ],
                        props: {
                            'clearable': true,
                            'placeholder': _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['催办人员'])
                                : this.i18nMappingObj['催办人员'],
                            'multiple': true,
                            'collapse-tags': true,
                            'row': {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.userOidsList
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'notifyWay',
                        component: 'FamCheckbox',
                        label: this.i18nMappingObj['通知方式'],
                        disabled: false,
                        required: !this.readonly,
                        hidden: false,
                        validators: [
                            {
                                trigger: ['change'],
                                validator: (rule, value, callback) => {
                                    if (!value.length) {
                                        return callback(
                                            new Error(
                                                _.isFunction(this.i18nMappingObj['组件提示'])
                                                    ? this.i18nMappingObj['组件提示'](
                                                    's',
                                                    this.i18nMappingObj['通知方式']
                                                    )
                                                    : this.i18nMappingObj['通知方式']
                                            )
                                        );
                                    }
                                    callback();
                                }
                            }
                        ],
                        props: {
                            placeholder: _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('s', this.i18nMappingObj['通知方式'])
                                : this.i18nMappingObj['通知方式'],
                            type: 'checkbox',
                            options: this.notifyWayList
                        },
                        col: 24
                    },
                    {
                        field: 'content',
                        component: 'erd-input',
                        label: this.i18nMappingObj['内容'],
                        required: !this.readonly,
                        props: {
                            'type': 'textarea',
                            'rows': 5,
                            'clearable': true,
                            'maxlength': 500,
                            'show-word-limit': true,
                            'i18nName': this.i18nMappingObj['内容'],
                            'placeholder': _.isFunction(this.i18nMappingObj['组件提示'])
                                ? this.i18nMappingObj['组件提示']('i', this.i18nMappingObj['内容'])
                                : this.i18nMappingObj['内容']
                        },
                        col: 24
                    }
                ];
            },
            // 通知方式
            notifyWayList() {
                return [
                    {
                        label: this.i18nMappingObj.message,
                        value: '1'
                    },
                    {
                        label: this.i18nMappingObj['邮件'],
                        value: '2'
                    }
                ];
            }
        },
        watch: {
            processInstanceOid: {
                immediate: true,
                handler(processInstanceOid) {
                    processInstanceOid && this.getSolicitorList({ processInstanceOid });
                }
            }
        },
        methods: {
            // 表单校验
            submit() {
                const { famDynamicForm } = this.$refs || {},
                    { submit } = famDynamicForm || {};
                return submit();
            },
            submitApi(data) {
                return this.$famHttp({
                    url: '/bpm/task/urge',
                    method: 'POST',
                    data
                });
            },
            // 获取催办人员数组
            getSolicitorList(params) {
                this.$famHttp({
                    url: '/bpm/workitem/handlers',
                    method: 'GET',
                    params
                }).then((resp) => {
                    if (resp.success) {
                        let { data = [] } = resp || {};
                        this.userOidsList = _.map(data, (item) => ({
                            label: item.displayName,
                            value: item.oid
                        }));
                        if (this.userOids?.length) {
                            this.form.userOids = _.intersection(_.map(this.userOidsList, 'value'), this.userOids);
                        }
                    }
                });
            }
        }
    };
});
