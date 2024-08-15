define([
    ELMP.func('erdc-change/config/viewConfig.js'),
    'text!' + ELMP.func('erdc-change/components/BaseInfo/index.html'),
    'css!' + ELMP.func('erdc-change/components/BaseInfo/style.css')
], function (viewCfg, template) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('Change');
    const ScalableContainer = viewCfg.otherClassNameMap.scalableContainer;
    const SubFolder = viewCfg.otherClassNameMap.subFolder;

    return {
        name: 'ChangeBaseInfo',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            changeType: {
                type: String,
                default: 'PR'
            },
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 渲染布局表单方法
            renderLayoutForm: Function,
            vm: Object,
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
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                panelUnfold: true,
                formData: {},
                folderList: []
            };
        },
        computed: {
            oid() {
                return this?.vm?.containerOid;
            },
            ...mapGetters(['getViewTableMapping']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: this.changeType });
            },
            containerRef() {
                let value = this.$store.state.space?.context?.oid;
                // const type = this.$route?.query?.type || '';
                value = this.$route?.query?.containerRef || value;
                return value;
            },
            className() {
                return this.$route.query.pid?.split(':')?.[1] || '';
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || ScalableContainer;
            },
            formConfigs() {
                // 首页需要选择上下文
                let config = [
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: this.i18n.context,
                        labelLangKey: 'component',
                        disabled: false,
                        required: !(this.containerRef || this.oid), //UCD规范,只读无必填
                        validators: [],
                        hidden: this.changeType === 'ECA' || false,
                        readonly: !!this.containerRef || !!this.oid,
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
                                                  className: viewCfg.otherClassNameMap.pdmProduct
                                              },
                                              viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                              valueProperty: 'containerRef' // 显示value的key（如果里面也配置，取里面的）
                                              // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                                          },
                                          clearNoData: true
                                      }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: () => {
                                this.getFolder();
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18n.type,
                        labelLangKey: 'component',
                        disabled: false,
                        required: !this.oid,
                        validators: [],
                        hidden: false,
                        readonly: !!this.oid,
                        props: {
                            clearable: false,
                            placeholderLangKey: 'pleaseSelect',
                            defaultSelectFirst: true,
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: this.viewTableMapping.className,
                                        containerRef: this.$route.query.pid ? this.containerRef : '',
                                        accessControl: false
                                    }
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 12
                    }
                ];
                /**
                 * 添加文件夹配置
                 * 编辑布局、新增布局
                 */
                if (this.oid) {
                    const folderConfig = {
                        field: 'folderRef',
                        component: 'erd-input',
                        label: this.i18n.folder,
                        disabled: false,
                        required: false,
                        hidden: false,
                        readonly: true,
                        col: 12
                    };

                    config.push(folderConfig);
                } else {
                    const folderConfig = {
                        field: 'folderRef',
                        component: 'custom-select',
                        label: this.i18n.folder,
                        disabled: false,
                        required: true,
                        hidden: false,
                        readonly: false,
                        props: {
                            filterable: true,
                            treeSelect: true,
                            defaultSelectFirst: true,
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
                    };
                    config.push(folderConfig);
                }
                return config;
            },
            editableAttr() {
                const update = ['typeReference'];
                const create = ['containerRef'];
                const data = this.oid ? update : create;
                return data;
            }
        },
        watch: {
            'containerRef': {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.formData.containerRef = nv;
                        //创建问题通告时，创建变更任务，要获取问题通告的容器，再更新文件夹数据
                        if (!this.oid) {
                            this.getFolder();
                        }
                    }
                }
            },
            'formData.containerRef': {
                immediate: true,
                handler(nv) {
                    nv && this?.vm?.$emit('GetChangeContainer', nv);
                }
            },
            'currentData': {
                immediate: true,
                handler(nv) {
                    if (nv && this.oid) this.formData = nv;
                }
            }
        },
        methods: {
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
            },
            setTypeValue(data) {
                if (!_.isEmpty(data)) {
                    this.$set(this.formData, 'typeReference', data?.typeOid || '');
                    this.renderLayoutForm(data?.typeName || '', data?.typeOid || '');
                    //切换分类时，文件夹设置重置
                    if (this.folderList.length) {
                        let firstFolderOpts = this.folderList[0];
                        this.$set(this.formData, 'folderRef', firstFolderOpts?.oid || '');
                    }
                }
            },
            // 清空表单数据
            emptyFormData() {
                this.formData = {};
            },
            // 获取文件夾列表
            getFolder() {
                const { containerRef } = this.formData ?? {};
                this.$set(this.formData, 'folderRef', '');

                this.$famHttp({
                    url: '/fam/listAllTree',
                    params: {
                        className: SubFolder,
                        containerRef
                    }
                }).then((res) => {
                    this.folderList = res?.data || [];
                });
            }
        }
    };
});
