define([
    'text!' + ELMP.func('erdc-document/components/BaseInfo/index.html'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'TreeUtil',
    'css!' + ELMP.func('erdc-document/components/BaseInfo/style.css')
], function (template, viewConfig, utils, TreeUtil) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const ScalableContainer = 'erd.cloud.foundation.core.container.entity.ScalableContainer';
    const SubFolder = 'erd.cloud.foundation.core.folder.entity.SubFolder';

    return {
        name: 'DocumentBaseInfo',
        template,
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        props: {
            // 是否需要展示模板
            showTemplate: {
                type: Boolean,
                default: true
            },
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            /**
             * 创建时可设置typeReference、classifyReference字段默认值（通过通用表单配置传递进来）
             * */
            typeReference: {
                type: String,
                required: false
            },
            classifyReference: {
                type: String,
                required: false
            },
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 渲染布局表单方法
            renderLayoutForm: Function,
            // 自定义事件
            customEvent: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            vm: {
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
            },
            appName: String
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                panelUnfold: true,
                formData: {
                    classifyReference: null
                },
                ClassifyEnable: false,
                templateArr: [],
                classifyList: [],
                folderList: [],
                typeReferenceList: [],
                initFolder: true
            };
        },
        computed: {
            oid() {
                return this.$route?.query?.oid || '';
            },
            isTemplate() {
                return this.$route?.query?.isTemplate === 'true' || false;
            },
            schemaMapper() {
                let { isTemplate } = this;
                return {
                    containerRef(schema) {
                        if (isTemplate) {
                            schema = Object.assign(schema, {
                                component: 'Slot',
                                props: {
                                    name: 'container-slot',
                                    clearable: false
                                }
                            });
                        }
                    },
                    folderRef(schema) {
                        if (isTemplate) {
                            schema = Object.assign(schema, {
                                component: 'Slot',
                                props: {
                                    name: 'folder-slot',
                                    clearable: false
                                }
                            });
                        }
                    }
                };
            },
            // 从文件夹跳转过来创建对象，需要默认选中到此文件夹
            folderId() {
                return this.$route?.query?.folderId || '';
            },
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            className() {
                return viewConfig?.docViewTableMap?.className || this.oid?.split(':')?.[1] || '';
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || ScalableContainer;
            },
            formConfigs() {
                // 首页需要选择上下文
                return [
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: this.i18n.context,
                        labelLangKey: 'component',
                        disabled: false,
                        required: !(this.containerRef || this.oid), //UCD规范,只读无必填
                        validators: [],
                        hidden: false,
                        readonly: !!(this.containerRef || this.oid),
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
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.getFolder(data.value);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18n.type,
                        labelLangKey: 'component',
                        // 默认为false，当存在typeReference默认值时，将该选项置为disabled
                        disabled: !!this.typeReference,
                        required: !this.oid,
                        validators: [],
                        hidden: false,
                        readonly: !!this.oid,
                        props: {
                            clearable: false,
                            filterable: true,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                clearNoData: true,
                                viewProperty: 'displayName',
                                valueProperty: 'typeOid',
                                referenceList: this.typeReferenceList
                            }
                        },
                        listeners: {
                            callback: (data) => {
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'classifyReference',
                        component: 'erd-tree-select',
                        label: this.i18n.classify,
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: !this.ClassifyEnable,
                        props: {
                            'clearable': false,
                            'nodeKey': 'oid',
                            'data': this.classifyList,
                            'default-expand-all': true,
                            'filterable': true,
                            'props': {
                                label: 'displayName',
                                children: 'children',
                                disabled: 'disabled'
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            change: () => {}
                        },
                        col: 12
                    },
                    {
                        field: 'folderRef',
                        component: 'custom-select',
                        label: this.i18n.folder,
                        disabled: false,
                        required: !this.oid,
                        hidden: false,
                        readonly: !!this.oid,
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
                        listeners: {
                            change: () => {}
                        },
                        col: 12
                    },
                    {
                        field: 'templateInfo.templateReference',
                        component: 'custom-select',
                        label: this.i18n.module,
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: !this.showTemplate,
                        readonly: !!this.oid,
                        props: {
                            clearable: true,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                clearNoData: true,
                                viewProperty: 'displayName',
                                valueProperty: 'oid',
                                referenceList: this.templateArr
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                // 点击项目模板请求布局填充到详情信息里边
                                if (data.value) {
                                    this.getModuleFormData(data.value);
                                } else {
                                    this.formData.name = '';
                                    this.formData.templateInfo['templateReference'] = '';
                                    this.$emit('getLayoutData', {});
                                }
                            }
                        },
                        col: 12
                    }
                ];
            },
            editableAttr() {
                const update = ['typeReference', 'folderRef'];
                const create = ['containerRef'];
                return this.oid ? update : create;
            }
        },
        watch: {
            'containerRef': {
                immediate: true,
                handler(nv) {
                    this.initTypeReference();
                    if (nv) {
                        this.formData.containerRef = nv;
                    }
                }
            },
            'formData.containerRef': {
                immediate: true,
                handler(nv) {
                    nv && !this.isTemplate && this.getFolder(nv);
                }
            },
            'currentData': {
                immediate: true,
                handler(nv) {
                    if (nv && this.oid) {
                        this.formData = nv;
                        // 编辑时模板字段回显
                        nv?.typeReference && this.productModule(nv?.typeReference);
                    }
                }
            },
            'formData': {
                deep: true,
                immediate: true,
                handler: function (n) {
                    if (!_.isEmpty(n) && !_.isEmpty(this.customEvent)) {
                        _.each(n, (value, key) => {
                            _.isFunction(this.customEvent?.[key]) &&
                                this.customEvent?.[key]({ field: key }, value, this.$props);
                        });
                    }
                }
            }
        },
        methods: {
            getDisplayName(field) {
                return this.vm?.sourceData?.[field]?.displayName;
            },
            getTypeReferenceList() {
                // 如果存在pid则说明在空间下，则必须有空间id才能获取数据，否则认为在首页
                if (this.$route.query.pid && !this.containerRef) return Promise.resolve();
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    headers: {
                        'App-Name': this.appName || utils.getAppNameByResource()
                    },
                    params: {
                        typeName: this.className,
                        containerRef: this.$route.query.pid ? this.containerRef : '',
                        accessControl: false
                    }
                }).then((res) => {
                    return (this.typeReferenceList = res?.data || []);
                });
            },
            initTypeReference() {
                this.getTypeReferenceList().then((list) => {
                    if (!this.oid && list.length > 0) {
                        let selected = null;
                        if (this.typeReference) {
                            selected = list.find((item) => item.typeOid === this.typeReference);
                        } else {
                            [selected] = list;
                        }
                        selected && this.setTypeValue(selected);
                    }
                });
            },
            // 获取分类
            getClassify(code) {
                return this.$famHttp({
                    url: '/fam/classify/tree',
                    params: {
                        rootType: code
                    }
                }).then((res) => {
                    // 如果存在分类默认值，则需要将数据parentId 置为 ''
                    this.classifyList = (res?.data || []).map((item) => ({
                        ...item,
                        children: item.children ?? [],
                        parentId: ''
                    }));

                    TreeUtil.doPreorderTraversal(this.classifyList, {
                        every(item) {
                            item.disabled = !item.instantiable;
                        }
                    });

                    return this.classifyList;
                });
            },
            // 获取文件夹
            getFolder(containerRef) {
                this.$famHttp({
                    url: '/fam/listAllTree',
                    params: {
                        className: SubFolder,
                        containerRef
                    }
                }).then((res) => {
                    this.folderList = res?.data || [];
                    this.getDefaultFolder();
                });
            },
            getDefaultFolder() {
                const { containerRef, typeReference } = this.formData;

                // 如果有folderId，则表明是文件夹过来的创建，不用再取默认文件夹了
                if (this.folderId) return this.setFolderValue(this.folderId);
                
                if (!containerRef || !typeReference) return;
                const typeName = this.typeReferenceList.find((item) => item.typeOid === typeReference)?.typeName;

                this.$famHttp({
                    url: `/fam/folder/getDefaultFolder`,
                    method: 'GET',
                    params: {
                        containerRef,
                        typeName: typeName,
                        propertyName: 'defaultFolderName'
                    }
                }).then((res) => {
                    if (res && res.success) {
                        let defaultFolderPath = res.data.defaultFolderPath;
                        // 如果未配置默认文件夹，则默认选中文件夹中第一个节点
                        if (!defaultFolderPath) return this.setFolderValue(this.folderList[0].oid);

                        // 去除前面的'/'
                        if (defaultFolderPath.indexOf('/') === 0) {
                            defaultFolderPath = defaultFolderPath.slice(1, defaultFolderPath.length);
                        }
                        // 判断接口返回的defaultFolderPath是否以"Default/"开头，是则去除,不是则不处理
                        if (defaultFolderPath.indexOf('Default/') === 0) {
                            defaultFolderPath = defaultFolderPath.slice(8, defaultFolderPath.length);
                        }
                        const currentFolder = utils.getFolderByRoute(defaultFolderPath, this.folderList);
                        if (_.isEmpty(currentFolder)) {
                            this.setFolderValue(this.folderList[0].oid);
                        } else {
                            this.setFolderValue(currentFolder.oid);
                        }
                    }
                });
            },
            // 模板接口
            productModule(val) {
                this.$famHttp({
                    url: '/document/listByKey',
                    params: {
                        'typeReference': val,
                        'tmplTemplated': true,
                        'templateInfo.tmplEnabled': true,
                        'className': this.className
                    }
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.templateArr = res.data;
                        }
                    })
                    .catch((err) => {
                        this.$message({
                            message: err?.data?.message,
                            type: 'error',
                            showClose: true
                        });
                    });
            },
            // 获取项目模板对应的信息
            getModuleFormData(oid) {
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'get',
                    data: {
                        oid,
                        className: this.className
                    }
                })
                    .then((resp) => {
                        if (resp.code === '200') {
                            let data = resp.data?.rawData || {};
                            let resultData = ErdcKit.deserializeAttr(data, {
                                valueMap: {
                                    typeReference: (e, data) => {
                                        return data['typeReference']?.oid || '';
                                    }
                                }
                            });

                            this.$emit('getLayoutData', resultData);
                            this.formData['name'] = resultData.name;
                        }
                    })
                    .catch(() => {});
            },
            submit() {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    let formData = form.serializeEditableAttr();
                    form.submit().then((valid) => {
                        if (valid) {
                            // 通过默认值设置的typeReference 通过 serializeEditableAttr 方法无法获取
                            const data = [
                                ...formData,
                                { attrName: 'typeReference', value: this.formData.typeReference }
                            ];
                            resolve(data);
                        } else {
                            reject(false);
                        }
                    });
                });
            },
            async setTypeValue(data) {
                if (!_.isEmpty(data)) {
                    this.ClassifyEnable = data?.classifyEnable || false;
                    this.templateArr = [];
                    this.productModule(data.typeOid);
                    this.$set(this.formData, 'typeReference', data?.typeOid || '');
                    this.renderLayoutForm(data?.typeName || '', data?.typeOid || '');
                    /**
                     * 将分类默认值（字符串形式）转换为选择框组件的对象形式
                     * */
                    if (this.typeReference && this.classifyReference && !this.oid) {
                        let classifyDetail = null;
                        const resp = await this.$famHttp({
                            url: '/fam/classify/getByOid',
                            params: { oid: this.classifyReference }
                        });
                        classifyDetail = resp.data;
                        const classifyList = JSON.parse(
                            JSON.stringify(await this.getClassify(classifyDetail?.typeName))
                        );
                        let getFlattenClassifyList = function (list) {
                            return list.reduce(
                                (result, { children = [], ...rest }) => [
                                    ...result,
                                    rest,
                                    ...getFlattenClassifyList(children)
                                ],
                                []
                            );
                        };
                        const flattenClassifyList = getFlattenClassifyList(classifyList);
                        const matched = flattenClassifyList.find((item) => item.oid === this.classifyReference);
                        this.$set(this.formData, 'classifyReference', matched ? matched : null);
                    } else {
                        this.getClassify(data?.classifyCode);
                    }
                    /**
                     * end
                     * */
                    if (!this.isEdit && this.formData.containerRef) {
                        this.initFolder && this.folderId ? this.setFolderValue(this.folderId) : this.getDefaultFolder();
                        this.initFolder = false;
                    }
                }
            },
            setFolderValue(oid) {
                this.$set(this.formData, 'folderRef', oid);
            },
            // 清空表单数据
            emptyFormData() {
                this.formData = {};
            }
        }
    };
});
