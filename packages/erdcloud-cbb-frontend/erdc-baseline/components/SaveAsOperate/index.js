define([
    'text!' + ELMP.func('erdc-baseline/components/SaveAsOperate/index.html'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.func('erdc-baseline/components/batchEditMixin.js'),
    'css!' + ELMP.func('erdc-baseline/index.css')
], function (template, Constants, batchEditMixin) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');

    return {
        name: 'BaselineSaveAsOperate',
        template,
        props: {
            // 自定义上下文选项
            containerList: {
                type: Array,
                default: () => {
                    return ErdcStore.getters['cbbStore/getContainerList'] || [];
                }
            }
        },
        components: {
            FamCodeGenerator: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamCodeGenerator/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        mixins: [batchEditMixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                batchEditFormData: {
                    name: '',
                    context: '',
                    folder: ''
                },
                folderTree: [],
                contextOptions: [],
                className: Constants.className,
                folderExpandKeys: []
            };
        },
        methods: {
            async open(list, isDetail) {
                await this.getContexts();
                this.tableData = list.map((item) => {
                    const name = isDetail ? item.name : item[`${this.className}#name`];
                    const context = isDetail
                        ? item.containerRef
                        : item.attrRawList.find((attr) => attr.attrName === `${Constants.className}#containerRef`);
                    const folder = isDetail
                        ? item.folderRef
                        : item.attrRawList.find((attr) => attr.attrName === `${Constants.className}#folderRef`);
                    return {
                        name: name,
                        newName: '',
                        code: isDetail ? item.identifierNo : item[`${this.className}#identifierNo`],
                        context: context?.displayName,
                        newContext: '',
                        folder: folder?.displayName,
                        newFolder: '',
                        oid: item.oid,
                        identifierNo: isDetail ? item.identifierNo : item[`${this.className}#identifierNo`]
                    };
                });
                this.visible = true;
            },
            getContexts() {
                if (this.containerList.length > 0) {
                    this.contextOptions = this.containerList.map((i) => {
                        return {
                            label: i.displayName,
                            value: i.containerRef,
                            idKey: i.idKey,
                            id: i.id
                        };
                    });
                    if (this.contextOptions.length > 0) {
                        this.batchEditFormData.context = this.contextOptions[0].value;
                    }
                    return Promise.resolve(this.contextOptions);
                }
                return this.$famHttp({
                    url: 'fam/container/list',
                    params: {
                        className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
                    }
                }).then((resp) => {
                    if (resp.success) {
                        let contextOptions = resp.data || [];
                        this.contextOptions = contextOptions.map((i) => {
                            return {
                                label: i.displayName,
                                value: i.containerRef,
                                idKey: i.idKey,
                                id: i.id
                            };
                        });
                        if (this.contextOptions.length > 0) {
                            this.batchEditFormData.context = this.contextOptions[0].value;
                        }
                    }
                });
            },
            getContextConfig(oid) {
                return this.contextOptions.find((item) => item.value === oid);
            },
            getFolderTree(containerRef) {
                return this.$famHttp({
                    url: '/fam/listAllTree',
                    method: 'get',
                    params: {
                        className: 'erd.cloud.foundation.core.folder.entity.SubFolder',
                        containerRef: containerRef
                    }
                }).then((resp) => {
                    this.folderTree = resp.data || [];
                    this.folderExpandKeys = this.folderTree.length > 0 ? [this.folderTree[0].oid] : [];
                });
            },
            saveBatchEditData() {
                const { name, context, folder } = this.batchEditFormData;
                const applyBatchUpdateRows = this.tableData.filter(
                    (item) => this.selectedData.findIndex((sItem) => sItem.oid === item.oid) >= 0
                );
                applyBatchUpdateRows.forEach((item) => {
                    if (context) {
                        item.newContext = context;
                    }
                    if (folder) {
                        item.newFolder = folder;
                    }
                    if (name) {
                        item.newName = name;
                    }
                });
                this.visibleForBatchEdit = false;
            },
            handleContextChange(contextOid) {
                this.batchEditFormData.folder = null;
                this.getFolderTree(contextOid);
            },
            handleSingleContextChange(row) {
                row.newFolder = '';
                this.getFolderTree(row.newContext);
            },
            handleSaveAs() {
                if (this.tableData.some((item) => !item.newContext || !item.newFolder)) {
                    return this.$message.warning(this.i18n.saveAsValidateTip);
                }
                const data = this.tableData.map((item) => ({
                    oid: item.oid,
                    attrRawList: [{ attrName: 'containerRef', value: item.newContext ?? '' }],
                    name: item.newName,
                    folderRef: item.newFolder?.oid,
                    viewOid: '',
                    codeRule: '',
                    // identifierNo: item.identifierNo,
                    isAddToWorkspace: false,
                    workspaceOid: ''
                }));
                this.$famHttp({
                    url: '/baseline/saveAs',
                    method: 'post',
                    className: this.className,
                    data: data
                }).then((resp) => {
                    if (resp.success) {
                        this.$message.success(this.i18n.saveAsSuccessTip);
                        this.visible = false;
                        this.$emit('success');
                    }
                });
            }
        }
    };
});
