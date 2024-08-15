define([
    'text!' + ELMP.func('erdc-change/components/DialogBatch/index.html'),
    ELMP.func('erdc-change/api.js'),
    ELMP.func('erdc-change/config/viewConfig.js')
], function (template, api, viewCfg) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ChangeDialogBatch',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            visible: Boolean,
            isTable: Boolean,
            title: String,
            className: String,
            type: String,
            rowList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            stateList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 参与者选择
            queryParams: {
                type: Object,
                default: () => {
                    return {
                        data: {
                            appName: 'PDM',
                            isGetVirtualRole: true
                        }
                    }
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                loading: false,
                containerList: [],
                contextObj: {},
                folderObj: {},
                oldName: '',
                newContainerRef: '',
                folderList: [],
                treeProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                },
                formData: {
                    state: '',
                    context: '',
                    folder: '',
                    rename: '',
                    owner: ''
                },
                defaultMember: [],
                // 参与者范围
                queryScope: 'fullTenant'
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            // 上下文配置
            rowContext() {
                return {
                    componentName: 'virtual-select', // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
                    requestConfig: {
                        // 请求接口的配置对象
                        url: api.listByKey,
                        params: {
                            className: viewCfg.otherClassNameMap.pdmProduct
                        },
                        viewProperty: 'displayName', // 显示的label的key（如果里面也配置，取里面的）
                        valueProperty: 'containerRef' // 显示value的key（如果里面也配置，取里面的）
                        // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
                    },
                    clearNoData: true // value未匹配到option中数据时，清除数据项
                };
            },
            // 文件夹配置
            getRowFolder() {
                return {
                    clearNoData: true, // value未匹配到option中数据时，清除数据项
                    componentName: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'oid',
                    referenceList: this.folderList
                };
            },
            // 设置状态
            rowState() {
                return {
                    componentName: 'constant-select',
                    clearNoData: true,
                    viewProperty: 'displayName',
                    valueProperty: 'value',
                    referenceList: this.stateList
                };
            },
            formConfig() {
                let config = [];
                if (this.type === 'setState') {
                    config = [
                        {
                            field: 'state',
                            label: this.i18n.state,
                            slots: {
                                component: 'stateComponent'
                            },
                            col: 24
                        }
                    ];
                } else if (this.type === 'rename') {
                    config = [
                        {
                            field: 'name',
                            label: this.i18n.rename,
                            slots: {
                                component: 'nameComponent'
                            },
                            col: 24
                        }
                    ];
                } else if (this.type == 'owner') {
                    config = [
                        {
                            field: 'owner',
                            label: this.i18n.owner,
                            slots: {
                                component: 'ownerComponent'
                            },
                            col: 24
                        }
                    ];
                } else {
                    config = [
                        {
                            field: 'context',
                            label: this.i18n.context,
                            slots: {
                                component: 'contextComponent'
                            },
                            col: 24
                        },
                        {
                            field: 'folder',
                            label: this.i18n.folder,
                            slots: {
                                component: 'folderComponent'
                            },
                            col: 24
                        }
                    ];
                }
                return config;
            }
        },
        watch: {
            newContainerRef: {
                immediate: true,
                handler(nv) {
                    nv && this.getFolder(nv);
                }
            },
            rowList: {
                immediate: true,
                handler(nv) {
                    if (nv.length) {
                        let contextStr = [];
                        let folderStr = [];
                        let containerList = [];
                        nv.forEach((item) => {
                            contextStr.push(
                                this.isTable ? item[`${this.className}#containerName`] : item['containerName']
                            );
                            folderStr.push(this.isTable ? item[`${this.className}#folderRef`] : item['folderRef']);
                            containerList.push(item.oid);
                        });
                        this.oldName = this.unique(contextStr).join();
                        this.containerList = containerList;
                    }
                }
            }
        },
        methods: {
            // 去重
            unique(arr) {
                return Array.from(new Set(arr));
            },
            // eslint-disable-next-line no-unused-vars
            changeState(value, data) {
                const res = this?.stateList?.find((item) => item.value == value) || {};
                this.formData.stateName = res.displayName;
            },
            // 改变事件，返回当前选中的值
            // eslint-disable-next-line no-unused-vars
            changeContext(value, data, row) {
                this.newContainerRef = value;
                this.formData.folder = '';
                if (data) {
                    this.contextObj = {
                        id: data.id,
                        idKey: data.idKey,
                        name: data.name
                    };
                }
            },
            // eslint-disable-next-line no-unused-vars
            changeFolder(data, node, vm, row) {
                if (data) {
                    this.folderObj = {
                        id: data.id,
                        idKey: data.idKey,
                        name: data.name,
                        oid: data.oid
                    };
                }
            },
            getFolder(containerRef) {
                this.$famHttp({
                    url: '/fam/listAllTree',
                    params: {
                        className: viewCfg.otherClassNameMap.subFolder,
                        containerRef
                    },
                    method: 'GET'
                }).then((res) => {
                    this.folderList = res?.data || [];
                });
            },
            onSubmit() {
                if (this.type == 'setState') {
                    this.toggleShow();
                    this.$emit('batch-submit', this.formData);
                } else {
                    const data = {
                        memberList: this.containerList,
                        newContainerId: this.newContainerRef.split(':')[2] || '',
                        newContainerKey: this.newContainerRef.split(':')[1] || '',
                        newContainnerName: this.contextObj.name,
                        newFolderId: this.folderObj.id,
                        newFolderKey: this.folderObj.idKey,
                        oldContainnerName: this.oldName,
                        viewId: '',
                        rename: this.formData.rename,
                        owner: this.defaultMember.length && this.defaultMember[0]
                    };
                    const echoData = {
                        contextName: this.contextObj.name || '',
                        contextId: this.newContainerRef,
                        folderId: this.folderObj.oid || '',
                        folderName: this.folderObj.name || '',
                        rename: this.formData.rename,
                        owner: this.defaultMember.length && this.defaultMember[0]
                    };
                    this.toggleShow();
                    this.$emit('batch-submit', data, echoData);
                }
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 选中用户
            fnMemberSelect(memberIds, members) {
                const data = this?.defaultMember?.map((item) => {
                    return item.oid;
                });
                if (data?.length && data.includes(memberIds)) return;
                this.defaultMember = members;
            }
        }
    };
});
