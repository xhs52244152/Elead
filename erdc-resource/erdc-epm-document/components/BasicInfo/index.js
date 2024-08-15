define([
    'text!' + ELMP.func('erdc-epm-document/components/BasicInfo/index.html'),
    ELMP.func('/erdc-epm-document/config/viewConfig.js'),
    ELMP.func('erdc-epm-document/api.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.func('erdc-epm-document/components/BasicInfo/index.css')
], function (template, viewConfig, Api, utils) {
    const ErdcKit = require('erdc-kit');
    const SubFolder = 'erd.cloud.foundation.core.folder.entity.SubFolder';
    const ScalableContainer = 'erd.cloud.foundation.core.container.entity.ScalableContainer';

    return {
        name: 'CommonBaseInfo',
        template: template,
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        props: {
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            currentType: {
                type: String,
                default: 'create'
            },
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 渲染布局表单方法
            renderLayoutForm: Function
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-epm-document/locale/index.js'),
                panelUnfold: true,
                formData: {
                    typeReference: '',
                    isCreateAssociatedPart: false
                },
                typeList: [],
                folderList: [],
                viewTypes: [], //类型
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
                    }
                }
            },
            'formData.containerRef': {
                handler(newVal, oldVal) {
                    if (newVal && !oldVal) {
                        this.initForm();
                        if (!this.isEdit) {
                            this.getFolder(newVal);
                        }
                    }
                },
                immediate: true
            }
        },
        computed: {
            isEdit() {
                return this.currentType === 'edit';
            },
            // 从工作区相关对象跳转过来的上下文
            workspaceContainerRefOid() {
                return this.$route.query.workspaceContainerRefOid || '';
            },
            // 工作区oid
            workspaceOid() {
                return this.$route.query.workspaceOid || '';
            },
            oid() {
                return this.$route.query.oid;
            },
            // 从文件夹跳转过来创建对象，需要默认选中到此文件夹
            folderId() {
                return this.$route.query.folderId;
            },
            // 当前空间的上下文
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || ScalableContainer;
            },
            editableAttr() {
                const update = ['typeReference', 'folderRef'];
                const create = ['containerRef'];
                const data = this.oid ? update : create;
                return data;
            },
            formConfigs() {
                const { i18n, isEdit } = this;

                const config = [
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: i18n.context,
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
                    }
                ];

                config.push({
                    field: 'typeReference',
                    component: 'custom-select',
                    label: i18n.type,
                    labelLangKey: 'component',
                    disabled: false,
                    required: this.oid ? false : true,
                    validators: [],
                    hidden: false,
                    readonly: this.oid ? true : false,
                    props: {
                        filterable: true,
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
                            this.setTypeValue(data.selected);
                        }
                    },
                    col: 12
                });

                /**
                 * 添加文件夹配置
                 */
                let folderConfig = {};
                if (isEdit) {
                    folderConfig = {
                        field: 'folderShow',
                        component: 'erd-input',
                        label: i18n.folder,
                        disabled: false,
                        required: false,
                        hidden: false,
                        readonly: true,
                        col: 12
                    };
                } else {
                    folderConfig = {
                        field: 'folderRef',
                        component: 'custom-select',
                        label: i18n.folder,
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
                }
                config.push(
                    ...[
                        folderConfig,
                        {
                            field: 'isCreateAssociatedPart',
                            component: 'erd-radio',
                            readonlyComponent: 'FamBooleanStaticText',
                            label: i18n.relatePart,
                            disabled: false,
                            hidden: this.oid ? true : false,
                            col: 12,
                            slots: {
                                component: 'radioComponent'
                            }
                        }
                    ]
                );

                return config;
            }
        },
        methods: {
            initForm() {
                if (!this.oid) {
                    this.typeReference && this.$set(this.formData, 'typeReference', this.typeReference);
                }
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
            getTypeReferenceList() {
                // 如果存在pid则说明在空间下，则必须有空间id才能获取数据，否则认为在首页
                if (this.$route.query.pid && !this.containerRef) return Promise.resolve();
                return this.$famHttp({
                    url: Api.findAccessTypes,
                    appName: 'PDM',
                    params: {
                        subTypeEnum: 'ALL',
                        accessControl: false,
                        typeName: viewConfig.epmDocumentViewTableMap.className,
                        containerRef: this.$route.query.pid ? this.containerRef : ''
                    }
                }).then((res) => {
                    return (this.typeList = res?.data || []);
                });
            },
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
                let objectType = 'epmDocTargetSubfolderRef';

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
            setTypeValue(data) {
                this.$set(this.formData, 'typeReference', data.typeOid);
                this.renderLayoutForm(data.typeName, data.typeOid);
                if (!this.isEdit && this.formData.containerRef) {
                    this.initFolder && this.folderId ? this.setFolderValue(this.folderId) : this.getDefaultFolder();
                    this.initFolder = false;
                }
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
