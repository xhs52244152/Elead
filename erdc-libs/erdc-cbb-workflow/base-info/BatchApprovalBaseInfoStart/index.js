define(['text!' + ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfoStart/index.html')], function (
    template
) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    // 上下文ContainerKey
    const containerKey = 'erd.cloud.foundation.core.container.entity.ScalableContainer';

    return {
        name: 'BatchApprovalBaseInfoStart',
        template,
        components: {
            ProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/components/ProcessBasicInfo/index.js')
            ),
            FamDict: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDict/index.js'))
        },
        props: {
            // 回显的基本信息
            basicInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 自定义上下文选项
            containerList: {
                type: Array,
                default: () => {
                    return ErdcStore.getters['cbbStore/getContainerList'] || [];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfoStart/locale/index.js'),
                // 上下文ContainerKey
                containerKey,
                form: {}
            };
        },
        computed: {
            formConfigs() {
                return [
                    {
                        field: 'processName',
                        label: this.i18n['流程名称'],
                        component: 'erd-input',
                        required: true,
                        props: {
                            'maxlength': 30,
                            'show-word-limit': true,
                            'placeholder': this.i18n['请输入流程名称']
                        },
                        col: 12
                    },
                    {
                        field: 'priority',
                        label: this.i18n['优先级'],
                        component: 'fam-dict',
                        required: true,
                        props: {
                            itemName: 'priority_type'
                        },
                        col: 12
                    },
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: '上下文',
                        required: true,
                        readonly: !!this.form?.containerRef,
                        props: {
                            clearable: false,
                            filterable: true,
                            placeholderLangKey: 'pleaseSelect',
                            row:
                                this.containerList.length > 0
                                    ? {
                                          componentName: '',
                                          referenceList: this.containerList,
                                          viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                          valueProperty: 'containerRef'
                                      }
                                    : {
                                          componentName: 'virtual-select',
                                          requestConfig: {
                                              // 请求接口的配置对象
                                              url: 'fam/container/list',
                                              params: {
                                                  className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
                                              },
                                              viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                              valueProperty: 'containerRef' // 显示value的key（如果里面也配置，取里面的）
                                              // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                                          },
                                          clearNoData: true
                                      }
                        },
                        col: 12
                    },
                    {
                        field: 'description',
                        label: this.i18n['原因'],
                        component: 'erd-input',
                        required: true,
                        props: {
                            'type': 'textarea',
                            'maxlength': 500,
                            'autosize': { minRows: 2, maxRows: 3 },
                            'show-word-limit': true
                        },
                        col: 24
                    }
                ];
            },
            title() {
                return `${new Date().getTime().toString() + '_' + this.i18n['批量审批']}`;
            }
        },
        created() {
            this.$route?.query?.containerRef && this.$set(this.form, 'containerRef', this.$route?.query?.containerRef);
        },
        watch: {
            'basicInfos': {
                handler: function (nv) {
                    // 此时可能i18n还没有注册上
                    if (nv) {
                        ErdcKit.deferredUntilTrue(
                            () => !_.isEmpty(this.i18n),
                            () => {
                                this.form = {
                                    ...this.form,
                                    ...ErdcKit.deepClone(nv),
                                    processName: nv?.processName || this.title
                                };
                            }
                        );
                    }
                },
                immediate: true,
                deep: true
            },
            'basicInfos.extraInfoMap.containerRef': {
                handler: function (nv) {
                    if (nv) {
                        this.$set(this.form, nv.extraFiled, nv.extraFiledValue);
                    }
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            validate() {
                return new Promise((resolve) => {
                    this?.$refs?.processBasicInfoRef?.$refs?.famDynamicFormRef?.validate((valid) => {
                        resolve({ valid, data: this.getData(), message: this.i18n['请输入必填项'] });
                    });
                });
            },
            getData() {
                // 临时自己处理，后续改为调用平台数据处理逻辑
                const data = {};
                _.each(this.formConfigs, ({ field }) => {
                    if (field === 'priority' && _.isObject(this.form[field])) {
                        data.priority = this.form.priority.value;
                    } else {
                        data[field] = this.form[field];
                    }
                });
                return data;
            }
        }
    };
});
