define([
    'text!' + ELMP.func('erdc-part/components/BasicInfo/index.html'),
    ELMP.func('/erdc-part/config/viewConfig.js'),
    ELMP.func('erdc-part/api.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'TreeUtil',
    'css!' + ELMP.func('erdc-part/components/BasicInfo/index.css')
], function (template, viewConfig, Api, utils, TreeUtil) {
    const ErdcKit = require('erdc-kit');
    const SubFolder = 'erd.cloud.foundation.core.folder.entity.SubFolder';
    const ScalableContainer = 'erd.cloud.foundation.core.container.entity.ScalableContainer';

    return {
        name: 'PartBasicInfo',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            checkNameTips: {
                type: String,
                default: '请输入名称'
            },
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            customEvent: {
                type: Object,
                default: () => ({})
            },
            /**
             * 表单组件实例
             * */
            vm: {
                type: Object,
                default: () => ({})
            },
            currentType: {
                type: String,
                default: 'create'
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
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            onFieldChange: Function,
            // 渲染布局表单方法
            renderLayoutForm: Function
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-part/locale/index.js'),
                panelUnfold: true,
                formData: {
                    classifyReference: null
                },
                ClassifyEnable: false,
                typeList: [],
                classifyList: [],
                folderList: [],
                initFolder: true
            };
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
            'currentData': {
                immediate: true,
                handler(nv) {
                    if (nv && this.oid) {
                        this.formData = nv;
                        //判断是否显示分类属性
                        this.isShowClassifyReference();
                    }
                }
            },
            'formData.containerRef': {
                handler(newVal, oldVal) {
                    if (newVal && !oldVal) {
                        /**
                         * 可在此处进行默认值回填
                         * */
                        this.initForm();
                        if (!this.isEdit) {
                            this.getFolder(newVal);
                        }
                    }
                },
                immediate: true
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
        computed: {
            isEdit() {
                return this.currentType === 'edit';
            },
            oid() {
                return this.$route?.query?.oid || '';
            },
            // 从文件夹跳转过来创建对象，需要默认选中到此文件夹
            folderId() {
                return this.$route.query.folderId;
            },
            // 从工作区相关对象跳转过来的上下文
            workspaceContainerRefOid() {
                return this.$route.query.workspaceContainerRefOid || '';
            },
            // 工作区oid
            workspaceOid() {
                return this.$route.query.workspaceOid || '';
            },
            // 当前空间的上下文
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            className() {
                return this.$route.query.pid?.split(':')?.[1] || '';
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || ScalableContainer;
            },
            editableAttr() {
                const update = ['typeReference', 'folderRef'];
                const create = ['containerRef'];
                return this.oid ? update : create;
            },
            formConfigs() {
                const { i18n, isEdit } = this;

                const config = [
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: this.i18n.context,
                        labelLangKey: 'component',
                        disabled: false,
                        required: !isEdit,
                        validators: [],
                        hidden: false,
                        readonly: isEdit || !!this.containerRef || !!this.workspaceContainerRefOid,
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
                                        className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
                                    },
                                    viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                                    valueProperty: 'containerRef', // 显示value的key（如果里面也配置，取里面的）
                                    // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                                    transformResponse: [
                                        (data) => {
                                            let result = JSON.parse(data);
                                            // if (!this.containerRef) {
                                            //     const containerList = result.data ?? [];
                                            //     if (containerList.length > 0) {
                                            //         this.setContainerRef(containerList[0].oid);
                                            //     }
                                            // }
                                            if (this.workspaceContainerRefOid) {
                                                this.setContainerRef(this.workspaceContainerRefOid);
                                            }
                                            return result;
                                        }
                                    ]
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
                        // 默认为false，当存在typeReference默认值时，将该选项置为disabled
                        disabled: !!this.typeReference,
                        required: !this.oid,
                        validators: [],
                        hidden: false,
                        readonly: !!this.oid,
                        props: {
                            clearable: false,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'typeOid',
                                clearNoData: true,
                                referenceList: this.typeList
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.formData.classifyReference = '';
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 12
                    }
                ];

                /**
                 * 添加文件夹配置
                 */
                if (isEdit) {
                    const folderConfig = {
                        field: 'folderShow',
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

                const otherConfig = [
                    {
                        field: 'classifyReference',
                        component: 'erd-tree-select',
                        label: i18n.classify,
                        // readonly: !!this.oid,
                        required: !this.oid,
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
                        listeners: {
                            change: (oid) => {
                                this.setClassifyValue(oid);
                            }
                        },
                        col: 12
                    }
                ];
                config.push(...otherConfig);

                return config;
            }
        },
        created() {
            if (this.isEdit) this.getClassify();
        },
        methods: {
            /**
             * 创建时，根据props是否存在typeReference classifyReference进行表单默认值预填充
             * */
            initForm() {
                if (!this.oid) {
                    this.classifyReference && this.setClassifyValue(this.classifyReference);
                    this.typeReference && this.$set(this.formData, 'typeReference', this.typeReference);
                }
            },
            isShowClassifyReference() {
                let data = this.typeList.find((item) => item.typeOid === this.formData.typeReference);
                if (data) {
                    this.ClassifyEnable = data?.classifyEnable || false;
                }
            },
            innerOnFieldChange() {
                _.isFunction(this.onFieldChange) && this.onFieldChange(this.$props, ...arguments);
            },
            getTypeReferenceList() {
                // 如果存在pid则说明在空间下，则必须有空间id才能获取数据，否则认为在首页
                if (this.$route.query.pid && !this.containerRef) return Promise.resolve();
                return this.$famHttp({
                    url: Api.findAccessTypes,
                    appName: 'PDM',
                    params: {
                        subTypeEnum: 'ALL',
                        accessControl: false,
                        typeName: viewConfig.partViewTableMap.className,
                        containerRef: this.$route.query.pid ? this.containerRef : ''
                    }
                }).then((res) => {
                    return (this.typeList = res?.data || []);
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
                    } else {
                        this.isShowClassifyReference();
                    }
                });
            },
            // 获取分类列表
            getClassify(code) {
                return this.$famHttp({
                    url: '/fam/classify/tree',
                    appName: 'PDM',
                    params: {
                        rootType: code
                    }
                }).then((res) => {
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
            // 获取文件夾列表
            getFolder() {
                const { containerRef } = this.formData ?? {};
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

            /**
             * 根据类型获取默认文件夹
             */
            getDefaultFolder() {
                // 如果有folderId，则表明是文件夹过来的创建，不用再取默认文件夹了
                if (this.folderId) return this.setFolderValue(this.folderId);

                // 如果是工作区的相关对象创建，默认文件夹取工作区配的
                let isWorkarea = !_.isEmpty(this.workspaceOid) && !_.isEmpty(this.workspaceContainerRefOid);
                let objectType = 'partTargetSubfolderRef';

                this.fetchDefaultFolder(isWorkarea, objectType).then((res) => {
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
            fetchDefaultFolder(isWorkarea, objectType) {
                return new Promise((resolve, reject) => {
                    const { containerRef, typeReference } = this.formData;

                    if (!containerRef || !typeReference) {
                        reject();
                        return;
                    }
                    const typeName = this.typeList.find((item) => item.typeOid === typeReference)?.typeName;

                    if (!isWorkarea) {
                        this.$famHttp({
                            url: `/fam/folder/getDefaultFolder`,
                            method: 'GET',
                            params: {
                                containerRef,
                                typeName: typeName,
                                propertyName: 'defaultFolderName'
                            }
                        }).then((resp) => {
                            resolve(resp);
                        });
                    } else {
                        // 从工作区取默认文件夹
                        let workspaceOid = this.workspaceOid;
                        this.$famHttp({
                            url: '/fam/attr',
                            className: 'erd.cloud.pdm.workspace.entity.EpmWorkspace',
                            data: {
                                oid: workspaceOid
                            }
                        }).then((resp) => {
                            let defaultFolderPath = resp.data?.rawData?.[objectType]?.displayName || '';

                            let result = {
                                success: true,
                                data: {
                                    defaultFolderPath: defaultFolderPath
                                        ? defaultFolderPath.split('/').slice(1)?.join('/')
                                        : ''
                                }
                            };

                            resolve(result);
                        });
                    }
                });
            },
            setContainerRef(oid) {
                this.$set(this.formData, 'containerRef', oid);
            },
            async setTypeValue(data) {
                this.ClassifyEnable = data?.classifyEnable || false;
                this.$set(this.formData, 'typeReference', data.typeOid);
                if (this.typeReference && this.classifyReference && !this.oid) {
                    let classifyDetail = null;
                    const resp = await this.$famHttp({
                        url: '/fam/classify/getByOid',
                        params: { oid: this.classifyReference }
                    });
                    classifyDetail = resp.data;
                    const classifyList = JSON.parse(JSON.stringify(await this.getClassify(classifyDetail?.typeName)));
                    // eslint-disable-next-line no-inner-declarations
                    function getFlattenClassifyList(list) {
                        return list.reduce(
                            (result, { children = [], ...rest }) => [
                                ...result,
                                rest,
                                ...getFlattenClassifyList(children)
                            ],
                            []
                        );
                    }
                    const flattenClassifyList = getFlattenClassifyList(classifyList);
                    const matched = flattenClassifyList.find((item) => item.oid === this.classifyReference);
                    this.setClassifyValue(matched ? this.classifyReference : '');
                } else {
                    this.getClassify(data?.classifyCode);
                }
                this.renderLayoutForm(data.typeName, data.typeOid);
                if (!this.isEdit && this.formData.containerRef) {
                    this.initFolder && this.folderId ? this.setFolderValue(this.folderId) : this.getDefaultFolder();
                    this.initFolder = false;
                }
            },
            setClassifyValue(oid) {
                this.$set(this.formData, 'classifyReference', oid);
                // 创建部件页面选择分类属性时联动显示业务配置的属性
                this.$set(this.currentData, 'classifyReference', oid);
            },
            setFolderValue(oid) {
                this.$set(this.formData, 'folderRef', oid);
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
            // 清空表单数据
            emptyFormData() {
                this.formData = {};
            }
        }
    };
});
