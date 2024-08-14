define([
    'text!' + ELMP.resource('project-plan/components/ParentTask/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js')
], function (template, store, commonHttp) {
    return {
        props: {
            value: String,
            currentObjectOid: String,
            currentObjectName: String,
            projectOid: String,
            collectId: String,
            taskId: String,
            params: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            disabled: Boolean,
            type: String
        },
        template,
        data() {
            return {
                dataValue: '',
                parentTaskOptions: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['pleaseEnterKeyword'])
            };
        },
        computed: {
            isDisabled() {
                return this.$attrs.formConfig?.disabled || this.disabled;
            }
        },
        watch: {
            'value'(val) {
                this.dataValue = val;
            },
            'dataValue'(val) {
                this.$emit('input', val);
                this.$emit('change', val);
            },
            'currentObjectOid'(val) {
                if (val) {
                    this.initParentTask();
                }
            },
            'params.collectId'(newVal, oldVal) {
                if (this.type == 'parentTask' && newVal && oldVal && newVal != oldVal) {
                    this.parentTaskOptions = [];
                }
            }
        },
        created() {
            if (this.currentObjectOid) {
                if (this.currentObjectName) {
                    this.parentTaskOptions = [
                        {
                            oid: this.currentObjectOid,
                            displayName: this.currentObjectName
                        }
                    ];
                    this.dataValue = this.currentObjectOid;
                } else {
                    this.initParentTask();
                }
            }
        },
        mounted() {},
        methods: {
            initParentTask() {
                // 根据父任务oid查询其显示名
                commonHttp
                    .commonAttr({
                        data: {
                            oid: this.currentObjectOid
                        }
                    })
                    .then((resp = {}) => {
                        this.parentTaskOptions = [
                            {
                                oid: this.currentObjectOid,
                                displayName: resp.data?.caption?.split(' - ')?.[1]
                            }
                        ];
                        this.dataValue = this.currentObjectOid;
                    });
            },
            // 父任务搜索
            searchTaskMethod(keyword) {
                let data = {
                    keyword,
                    tmplTemplated: false
                };
                data = _.extend({}, data, this.params);
                if (this.type == 'parentTask' && !data.collectId) {
                    return this.$message({
                        type: 'info',
                        message: this.i18n.pleaseSelectPlanSet
                    });
                }
                this.$famHttp({
                    url: '/ppm/listByKey',
                    method: 'GET',
                    data: data
                }).then((resp) => {
                    this.parentTaskOptions = resp?.data || [];
                });
            }
        }
    };
});
