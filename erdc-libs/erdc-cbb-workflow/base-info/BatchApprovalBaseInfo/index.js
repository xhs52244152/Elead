define(['text!' + ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfo/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    // 上下文ContainerKey
    const containerKey = 'erd.cloud.foundation.core.container.entity.ScalableContainer';

    return {
        name: 'BatchApprovalBaseInfo',
        template,
        components: {
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js')),
            ProcessGuide: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-workflow/components/ProcessGuide/index.js')),
            ProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/components/ProcessBasicInfo/index.js')
            )
        },
        props: {
            // 回显的基本信息
            basicInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 整个流程详情信息
            processInfos: {
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
                i18nPath: ELMP.resource('erdc-cbb-workflow/base-info/BatchApprovalBaseInfo/locale/index.js'),
                // 上下文ContainerKey
                containerKey,
                form: {},
                guideUnfold: true,
                infoUnfold: true
            };
        },
        computed: {
            formConfigs() {
                return [
                    {
                        field: 'proposerRef',
                        label: this.i18n['创建人'],
                        slots: {
                            readonly: 'avatar'
                        },
                        readonly: true,
                        col: 12
                    },
                    {
                        field: 'title',
                        label: this.i18n['启动者'],
                        readonly: true,
                        slots: {
                            readonly: 'avatar'
                        },
                        col: 12
                    },
                    {
                        field: 'priority',
                        label: this.i18n['优先级'],
                        component: 'fam-dict',
                        readonly: true,
                        props: {
                            itemName: 'priority_type'
                        },
                        col: 12
                    },
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: '上下文',
                        readonly: true,
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
                        readonly: true,
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
            users() {
                return (
                    _.filter(
                        this.processInfos?.userDtos || [],
                        (item) => item?.id === this.processInfos?.startUserId
                    ) || []
                );
            }
        },
        watch: {
            'basicInfos.processBasicInfo': {
                handler: function (nv) {
                    if (nv) {
                        this.form = { ...this.form, ...ErdcKit.deepClone(nv), priority: nv?.priority?.toString() };
                    }
                },
                immediate: true,
                deep: true
            },
            'basicInfos.processBasicInfo.extraInfoMap.containerRef': {
                handler: function (nv) {
                    if (nv) {
                        this.$set(this.form, nv.extraFiled, nv.extraFiledValue);
                    }
                },
                immediate: true,
                deep: true
            }
        }
    };
});
