define([
    'text!' + ELMP.func('erdc-workspace/components/BasicInfo/index.html'),
    ELMP.func('erdc-workspace/api.js'),
    'css!' + ELMP.func('erdc-workspace/components/BasicInfo/index.css')
], function (template, Api) {
    const SubFolder = 'erd.cloud.foundation.core.folder.entity.SubFolder';
    const ScalableContainer = 'erd.cloud.foundation.core.container.entity.ScalableContainer';
    return {
        name: 'WorkSpaceBaseInfo',
        template,
        props: {
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-workspace/locale/index.js'),
                panelUnfold: true,
                formData: {},
                folderList: []
            };
        },
        watch: {
            'currentData': {
                immediate: true,
                handler(nv) {
                    if (nv && this.oid) {
                        this.formData = nv;
                    }
                }
            },
            'formData.containerRef': {
                handler(newVal, oldVal) {
                    if (newVal && !oldVal) {
                        this.getFolder(newVal);
                    }
                },
                immediate: true
            }
        },
        computed: {
            oid() {
                return this.$route.query.oid;
            },
            // 当前空间的上下文
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || ScalableContainer;
            },
            formConfigs() {
                const { i18n } = this;
                let config = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: i18n.name,
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: i18n.pleaseEnterContent
                        },
                        col: 12
                    },
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: i18n.context,
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        hidden: false,
                        readonly: true,
                        props: {
                            clearable: false,
                            filterable: true,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                requestConfig: {
                                    // 请求接口的配置对象
                                    url: Api.listByKey,
                                    params: {
                                        className: this.containerKey
                                    },
                                    viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                    valueProperty: 'oid', // 显示value的key（如果里面也配置，取里面的）
                                    // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                                    transformResponse: [
                                        (data) => {
                                            let result = JSON.parse(data);
                                            return result;
                                        }
                                    ]
                                },
                                clearNoData: true
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: i18n.description,
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            'clearable': true,
                            'maxlength': 100,
                            'type': 'textarea',
                            'show-word-limit': true,
                            'placeholder': i18n.pleaseEnterContent
                        },
                        col: 24
                    }
                ];
                if (this.folderList.length) {
                    config.splice(
                        1,
                        0,
                        ...[
                            {
                                field: 'partTargetSubfolderRef',
                                component: 'custom-select',
                                label: this.i18n.partTargetSubfolderRef,
                                disabled: false,
                                required: true,
                                hidden: false,
                                readonly: false,
                                props: {
                                    filterable: true,
                                    treeSelect: true,
                                    treeProps: {
                                        label: 'displayName',
                                        children: 'childList',
                                        value: 'oid'
                                    },
                                    row: {
                                        componentName: 'constant-select',
                                        clearNoData: true,
                                        viewProperty: 'displayName',
                                        valueProperty: 'oid',
                                        referenceList: this.folderList
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'epmDocTargetSubfolderRef',
                                component: 'custom-select',
                                label: i18n.epmDocTargetSubfolderRef,
                                disabled: false,
                                required: true,
                                hidden: false,
                                props: {
                                    filterable: true,
                                    treeSelect: true,
                                    treeProps: {
                                        label: 'displayName',
                                        children: 'childList',
                                        value: 'oid'
                                    },
                                    row: {
                                        componentName: 'constant-select',
                                        clearNoData: true,
                                        viewProperty: 'displayName',
                                        valueProperty: 'oid',
                                        referenceList: this.folderList
                                    }
                                },
                                col: 12
                            }
                        ]
                    );
                }
                return config;
            }
        },
        methods: {
            getFolder() {
                const { containerRef } = this.formData ?? {};

                this.$famHttp({
                    url: Api.listAllTree,
                    params: {
                        className: SubFolder,
                        containerRef
                    }
                }).then((res) => {
                    this.folderList = res?.data || [];
                });
            },
            submit() {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    let formData = form.serializeEditableAttr();
                    form.submit().then((valid) => {
                        if (valid) {
                            resolve(formData);
                        } else {
                            reject(false);
                        }
                    });
                });
            }
        }
    };
});
