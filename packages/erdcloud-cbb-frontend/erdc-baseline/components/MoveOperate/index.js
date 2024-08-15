define([
    'text!' + ELMP.func('erdc-baseline/components/MoveOperate/index.html'),
    ELMP.func('erdc-baseline/components/batchEditMixin.js'),
    'css!' + ELMP.func('erdc-baseline/index.css')
], function (template, batchEditMixin) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');

    return {
        name: 'BaselineMoveOperate',
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
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        mixins: [batchEditMixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                newContext: null,
                newFolder: null,
                folderTree: [],
                selectedData: [],
                batchEditFormData: {
                    context: '',
                    folder: ''
                },
                contextOptions: [],
                folderExpandKeys: []
            };
        },
        computed: {
            isBatchEdit() {
                return this.tableData.length > 1;
            },
            editConfig() {
                // return { trigger: 'click', mode: 'cell' };
                return this.isBatchEdit ? {} : { trigger: 'click', mode: 'cell' };
            }
        },
        methods: {
            getNewContext() {
                if (this.batchEditFormData.context) {
                    return this.contextOptions.find((i) => i.value === this.batchEditFormData.context);
                }
            },
            getNewFolder() {
                return this.batchEditFormData.folder;
            },
            open(rows, isDetail) {
                if (!_.isArray(rows)) {
                    rows = [rows];
                }
                this.getContexts().then(() => {
                    this.tableData = rows.map((i) => {
                        return {
                            name: isDetail ? i.name : i['erd.cloud.cbb.baseline.entity.Baseline#name'],
                            code: isDetail ? i.identifierNo : i['erd.cloud.cbb.baseline.entity.Baseline#identifierNo'],
                            context: isDetail
                                ? i.containerRef?.displayName
                                : i['erd.cloud.cbb.baseline.entity.Baseline#containerRef'],
                            newContext: '',
                            // newContextId: '',
                            // newContextKey: '',
                            // newContextLabel: '',
                            folder: isDetail
                                ? i.folderRef?.displayName
                                : i['erd.cloud.cbb.baseline.entity.Baseline#folderRef'],
                            newFolder: '',
                            // newFolderKey: '',
                            // newFolderId: '',
                            // newFolderLabel: '',
                            oid: i.oid
                        };
                    });
                    this.visible = true;
                });
            },
            saveBatchEditData() {
                let newContext = this.getNewContext();
                let newFolder = this.getNewFolder();
                // const applyBatchUpdateRows = this.tableData.filter(
                //     (item) => this.selectedData.findIndex((sItem) => sItem.oid === item.oid) >= 0
                // );
                const applyBatchUpdateRows = this.selectedData.length ? this.selectedData : this.tableData;
                applyBatchUpdateRows.forEach((item) => {
                    if (newContext) {
                        item.newContext = newContext.value;
                    }
                    if (newFolder) {
                        item.newFolder = newFolder;
                    }
                });
                this.visibleForBatchEdit = false;
            },
            handleSingleContextChange(row) {
                row.newFolder = '';
                this.batchEditFormData.context = row.newContext;
                this.getFolderTree(row.newContext);
            },
            handleSingleFolderChange(row) {
                if (_.isObject(row.newFolder) && Object.keys(row.newFolder).length) {
                    this.batchEditFormData.folder = row.newFolder;
                }
            },
            getContextConfig(oid) {
                return this.contextOptions.find((item) => item.value === oid);
            },
            handleContextChange(contextOid) {
                this.batchEditFormData.folder = null;
                this.getFolderTree(contextOid);
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
                    }
                });
            },
            checkBeforeSubmit() {
                let newContext = this.tableData.some((item) => !item.newContext);
                if (newContext) {
                    this.$message.warning(this.i18n.contextRequireTips);
                    return false;
                }
                let newFolder = this.tableData.some((item) => !item.newFolder);
                if (newFolder) {
                    this.$message.warning(this.i18n.folderRequireTips);
                    return false;
                }
                return true;
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
            handleMove() {
                if (this.checkBeforeSubmit()) {
                    let data = {
                        memberList: this.tableData.map((i) => i.oid)
                    };
                    let newContext = this.getNewContext();
                    let newFolder = this.getNewFolder();
                    if (newContext) {
                        data.newContainerId = newContext.value.split(':')[2] || '';
                        data.newContainerKey = newContext.value.split(':')[1] || '';
                        data.newContainerName = newContext.label;
                    }
                    if (newFolder) {
                        data.newFolderId = newFolder.id;
                        data.newFolderKey = newFolder.idKey;
                        data.newFolderName = newFolder.displayName;
                    }
                    this.$famHttp({
                        url: '/fam/folder/batchMoveObject',
                        method: 'post',
                        data: data
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18n.updateSuccess);
                            this.visible = false;
                            this.$emit('success');
                        }
                    });
                }
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            }
        }
    };
});
