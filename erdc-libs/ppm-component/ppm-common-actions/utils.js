define([
    'vue',
    'erdcloud.kit',
    'erdc-kit',
    'erdcloud.router',
    'erdcloud.store',
    ELMP.resource('ppm-utils/locale/index.js'),
    ELMP.resource('ppm-store/index.js')
], function (Vue, ErdcKit, famUtils, router, store, { i18nMappingObj }, ppmStore) {
    let utils = {
        // 根据vue options渲染组件
        useFreeComponent(vueOptions) {
            let instance = new Vue({
                store: store,
                router: router,
                ...vueOptions
            });

            instance.$mount();

            let destroy = function () {
                instance.$destroy();
            };

            return {
                instance,
                destroy
            };
        },
        // 渲染设置状态面板
        renderSetState(props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `<set-state v-bind="params" @cancel="cancel" @confirm="confirm"></set-state>`,
                components: {
                    SetState: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SetState/index.js'))
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    cancel() {
                        destroy();
                    },
                    confirm(value) {
                        callback(value, destroy);
                    }
                }
            });
        },
        // 渲染复制或移动弹窗
        renderCopyOrMovePanel(props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `
                        <copy-or-move-comp
                            :visible.sync="params.showCopyOrMoveDialog"
                            v-bind="params"
                            @editCopyOrMoveConfirm="editCopyOrMoveConfirm"
                        ></copy-or-move-comp>
                        `,
                components: {
                    CopyOrMoveComp: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/CopyOrMove/index.js')
                    )
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    editCopyOrMoveCancel() {
                        destroy();
                    },
                    editCopyOrMoveConfirm(data) {
                        callback(data, destroy);
                    }
                }
            });
        },
        // 渲染选择流程面板
        renderSelectProcess(props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `
                    <select-process
                        :visible.sync="params.showDialog"
                        :process-data="params.processData"
                        @confirm="selectProcessData"
                    >
                    </select-process>
                `,
                components: {
                    SelectProcess: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/SelectProcess/index.js')
                    )
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    selectProcessData(data) {
                        callback(data, destroy);
                    }
                }
            });
        },
        // 渲染导出弹窗
        renderExportDialog(props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `
                    <export-dialog
                        :visible.sync="params.showDialog"
                        v-bind="params"
                        @onsubmit="fnColSettingSubmit"
                    ></export-dialog>
                `,
                components: {
                    ExportDialog: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/ExportDialog/index.js')
                    )
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    fnColSettingSubmit(data) {
                        callback(data, destroy);
                    }
                }
            });
        },
        // 渲染导入弹窗
        renderImportDialog(props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `
                    <import-dialog
                        :visible.sync="params.showDialog"
                        v-bind="params"
                        @before-submit="beforeSubmit"
                    ></import-dialog>
                `,
                components: {
                    ImportDialog: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/ImportDialog/index.js')
                    )
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    beforeSubmit(data) {
                        callback(data, destroy);
                    }
                }
            });
        },
        // 渲染批量编辑面板
        renderSetEdit(vm, props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `<batch-set-value
                   :vm="vm"
                    :visible.sync="setValue.visible"
                    :table-data="setValue.tableData"
                    :class-name="className"
                    @set-value-success="setValueSuccess"
                >
                </batch-set-value>`,
                components: {
                    BatchSetValue: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BatchSetValue/index.js')
                    )
                },
                data() {
                    return {
                        vm,
                        setValue: {
                            visible: false,
                            tableData: []
                        },
                        className: 'erd.cloud.ppm.plan.entity.Task'
                    };
                },
                created() {
                    // this.params = props;
                    this.setValue = props;
                },
                methods: {
                    setValueSuccess() {
                        this.setValue.tableData = [];
                        this.setValue.visible = false;
                        destroy();
                        vm.refresh();
                    },
                    cancel() {
                        destroy();
                    },
                    confirm(value) {
                        callback(value, destroy);
                    },
                    beforeSubmit(data) {
                        callback(data, destroy);
                    }
                }
            });
        },
        // 渲染文档弹窗
        renderDocumentDialog(props, callback) {
            let { destroy } = utils.useFreeComponent({
                template: `
                    <document-dialog
                        :visible.sync="params.showDialog"
                        v-bind="params"
                        @before-submit="beforeSubmit"
                    >
                    </document-dialog>
                `,
                components: {
                    DocumentDialog: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/DocumentDialog/index.js')
                    )
                },
                data() {
                    return {
                        params: {}
                    };
                },
                created() {
                    this.params = props;
                },
                methods: {
                    cancel() {
                        destroy();
                    },
                    confirm(value) {
                        callback(value, destroy);
                    },
                    beforeSubmit(docVm) {
                        callback(docVm, destroy);
                    }
                }
            });
        },
        // 渲染导入导出成功通知弹窗
        renderImportOrExportNotify(vm, { title, opts, params = {}, type, customClass, message }) {
            vm.$notify({
                title: title,
                dangerouslyUseHTMLString: true,
                message:
                    message ||
                    `
                    <div style="font-size: var(--fontSizeMini);color: var(--colorTextPlaceholder)">
                        请您前往“首页>我的导入导出”${opts}
                    </div>
                    <a class="ppm-link-name download-export-file" style="font-size: var(--fontSizeMini)">
                        前往${opts}
                    </a>
                `,
                type: type || 'success',
                customClass: customClass || '',
                position: 'bottom-left'
            });
            const doms = document.getElementsByClassName('download-export-file');
            doms[doms.length - 1].addEventListener('click', () => {
                const appName = 'erdc-portal-web';
                const targetPath = '/biz-import-export/myImportExport';
                // path组装query参数
                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, params)}`;
                window.open(url, appName);
            });
        },
        /**
         * 校验当前任务下关联任务时间是否在该任务时间范围内
         * @param {Object} vm
         * @param {Object} data
         * @param {Function} callback
         */
        commonCheckPreTaskTime: function (vm, data = {}, callback) {
            return new Promise((resolve) => {
                vm.$famHttp({
                    url: '/ppm/plan/v1/verifyConstraintTime',
                    method: 'POST',
                    data
                }).then((resp) => {
                    if (resp.code == '10060') {
                        vm.$message({
                            showClose: true,
                            type: 'error',
                            // duration: '3s',
                            dangerouslyUseHTMLString: true,
                            message: resp.message
                        });
                    } else if (resp.code == '10050') {
                        vm.$confirm(resp.message, i18nMappingObj.associatedTaskCheck, {
                            dangerouslyUseHTMLString: true,
                            distinguishCancelAndClose: true,
                            confirmButtonText: i18nMappingObj.confirm,
                            cancelButtonText: i18nMappingObj.cancel
                        }).then(() => {
                            if (callback && _.isFunction(callback)) callback();
                            resolve(resp);
                        });
                    } else {
                        if (callback && _.isFunction(callback)) callback();
                        resolve(resp);
                    }
                });
            });
        },
        renderFilePreview: (row, config = {}) => {
            let { customPreview, props } = config;
            utils.useFreeComponent({
                template: `
                    <fam-file-preview ref="filePreview" v-bind="props"></fam-file-preview>
                `,
                components: {
                    FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
                },
                data() {
                    return {
                        params: {},
                        props: {}
                    };
                },
                computed: {
                    documentClassName() {
                        return ppmStore.state.classNameMapping.document;
                    }
                },
                mounted() {
                    this.props = props;
                    if (_.isFunction(customPreview)) {
                        customPreview(this);
                    } else {
                        this.$famHttp({
                            url: '/document/content/attachment/list',
                            method: 'GET',
                            className: this.documentClassName,
                            params: {
                                objectOid: row.oid
                            }
                        }).then((res) => {
                            const {
                                storeId,
                                displayName: fileName,
                                authorizeCode
                            } = res.data.attachmentDataVoList.find((item) => item.role === 'PRIMARY') || {};

                            famUtils.previewFile({
                                fileName,
                                fileId: storeId,
                                authCode: authorizeCode
                            });
                        });
                    }
                }
            });
        },
        // 这个是平台提供的移动组件，一般用于【项目】【文档】、【知识库】文档、【工作台】【我的知识】
        renderMoveDialog: ({ vm, params, contextTitle }) => {
            utils.useFreeComponent({
                template: `
                    <folder-list-config
                        :visible.sync="dialogVisible"
                        :title="title"
                        :set-form-config="setFormConfig"
                        form-type="FOLDER_MOVE_FORM"
                        open-type="moveFolder"
                        :extend-tree-params="extendTreeParams"
                        v-bind="props"
                        @onsubmit="onSubmit"
                    ></folder-list-config>
                `,
                components: {
                    FolderListConfig: ErdcKit.asyncComponent(
                        ELMP.resource('erdc-product-components/FolderListConfig/index.js')
                    )
                },
                data() {
                    return {
                        title: i18nMappingObj.moveTo,
                        dialogVisible: true,
                        props: {},
                        extendTreeParams: {
                            url: '/fam/folder/listAllTree'
                        }
                    };
                },
                created() {
                    this.props = params;
                },
                methods: {
                    onSubmit(data) {
                        this.$router
                            .replace({
                                ...this.$route,
                                query: { ...this.$route?.query, folderOid: data }
                            })
                            .then(() => {
                                vm?.refresh(this.props.rowData?.[0]?.oid);
                            });
                    },
                    setFormConfig(formConfigList) {
                        const formatDataKey = ['FOLDER_FORM', 'FOLDER_MOVE_FORM'];
                        _.each(formatDataKey, (key) => {
                            let result = formConfigList[key];
                            _.each(result, (item) => {
                                if (item.field === 'context') {
                                    item.label =
                                        contextTitle ||
                                        (ppmStore.state.projectInfo['templateInfo.tmplTemplated']
                                            ? i18nMappingObj.projectModule
                                            : i18nMappingObj.belongProject);
                                    item.disabled = true;
                                    item.readonly = true;
                                }
                            });
                        });
                    }
                }
            });
        }
    };

    return utils;
});
