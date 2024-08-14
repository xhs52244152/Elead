define([ELMP.resource('ppm-component/ppm-common-actions/index.js'), ELMP.resource('ppm-store/index.js')], function (
    commonActions,
    store
) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <div class="h-100p">
                <folder-list
                    ref="folderList"
                    v-bind="folderProps"
                >
                    <template #custom-tree-node="{scope}">
                        <div
                            class="custom-tree-node"
                            @mouseenter="mouseenter(scope)"
                            @mouseleave="mouseleave(scope)"
                        >
                            <div
                                class="tree-text"
                                :title="scope.node.label"
                            >
                                <em
                                    class="erd-iconfont erd-icon-folder"
                                    style="font-size: 16px"
                                ></em>
                                <span>{{scope.node.label}}</span>
                            </div>
                            <div
                                class="tree-operation"
                                v-show="scope.data.show"
                                @click.stop
                            >
                                <erd-button
                                    v-if="scope.node.level == 1"
                                    type="icon"
                                    size="mini"
                                    icon="erd-iconfont erd-icon-add-document fontSize18"
                                    :disabled="!addEnabled"
                                    @click="createFolder(scope.node, scope.data)"
                                >
                                </erd-button>
                                <span
                                    class="edit-hover"
                                    v-if="editingNodeId !== scope.data.id && scope.node.level !== 1"
                                >
                                    <erd-button
                                        type="icon"
                                        size="mini"
                                        icon="erd-iconfont erd-icon-add-document"
                                        :disabled="!addEnabled"
                                        @click="createFolder(scope.node, scope.data)"
                                    >
                                    </erd-button>
                                    <el-button
                                        type="icon"
                                        size="mini"
                                        icon="erd-iconfont erd-icon-edit3"
                                        :disabled="!editEnabled"
                                        @click.stop="onEdit(scope.data)"
                                    ></el-button>
                                    <el-button
                                        type="icon"
                                        size="mini"
                                        icon="erd-iconfont erd-icon-delete2"
                                        :disabled="!delEnabled"
                                        @click.stop="onRemove(scope.node, scope.data)"
                                    ></el-button>
                                </span>
                            </div></div
                    ></template>
                    <template #column:default:name="{ data }">
                        <span
                            class="text-link cursor-pointer"
                            @click="openDocument(data)"
                            >{{ data.row.name }}</span
                        >
                    </template>
                    <template #column:default:identifierNo="{ data }"> {{ data.row.identifierNo || '—' }} </template>
                    <template #column:default:version="{ data }"> {{ data.row.version || '—' }} </template>
                    <template #column:default:statusDisplayName="{ data }"> {{ data.row.statusDisplayName || '—' }} </template>
                    <template #column:default:operation="{ data }">
                        <fam-action-pulldowm
                            :is-operation="true"
                            :action-config="getActionConfig(data.row)"
                            :action-data="data.row"
                            :args="[vm, data.row, true]"
                        ></fam-action-pulldowm>
                    </template>
                    <template #column:default:icon="{ data }">
                        <i
                            v-if="data.row.idKey === folderClassName"
                            :class="data.row.icon"
                        ></i>
                        <i
                            v-else
                            :class="getIconStyle(data.row.icon).iconClass"
                            :style="getIconStyle(data.row.icon).iconStyle"
                        ></i>
                    </template>
                </folder-list>
                <fam-file-preview ref="filePreview"></fam-file-preview>
            </div>
        `,
        components: {
            FolderList: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/FolderList/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                vm: null,
                i18nLocalePath: ELMP.resource('project-folder/locale/index.js'),
                i18nMappingObj: {
                    project: this.getI18nByKey('project')
                }
            };
        },
        computed: {
            productOid() {
                return this.$store.state.space?.context?.oid;
            },
            containerRef() {
                let projectInfo = store.state.projectInfo;
                return `OR:${projectInfo?.containerRef?.key}:${projectInfo?.containerRef?.id}`;
            },
            slotsField() {
                return [
                    {
                        prop: 'name',
                        type: 'default'
                    },
                    {
                        prop: 'identifierNo',
                        type: 'default'
                    },
                    {
                        prop: 'version',
                        type: 'default'
                    },
                    {
                        prop: 'statusDisplayName',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            folderProps() {
                return {
                    'toolbar-operation-type': 'PPM_PROJECT_FOLDER_LIST_MENU',
                    'container-ref': this.productOid,
                    'vm': this.vm,
                    'appName': 'PPM',
                    'slotsField': this.slotsField,
                    'setFormConfig': this.setFormConfig,
                    'extendTreeParams': { url: '/fam/folder/listAllTree' },
                    'changeTableConfig': (config) => {
                        // 过滤没权限数据
                        config.tableRequestConfig.data.deleteNoPermissionData = true;
                        return config;
                    }
                };
            },
            // FolderList实例
            folderListRef() {
                return this.$refs?.folderList || {};
            },
            // 左侧树实例
            folderListTreeRef() {
                let [folderListTreeRef] = this.folderListRef?.$refs?.FolderListTree || [{}];
                return folderListTreeRef;
            },
            delEnabled() {
                return this.folderListTreeRef.delEnabled;
            },
            editEnabled() {
                return this.folderListTreeRef.editEnabled;
            },
            addEnabled() {
                return this.folderListTreeRef.addEnabled;
            },
            editingNodeId() {
                return this.folderListTreeRef.editingNodeId;
            },
            // 右侧表格实例
            folderListDetailRef() {
                let [FolderListDetail] = this.folderListRef?.$refs?.FolderListDetail || [{}];
                return FolderListDetail;
            },
            documentClassName() {
                return store.state.classNameMapping.document;
            },
            folderClassName() {
                return this.$store.getters.className('subFolder');
            }
        },
        mounted() {
            this.vm = this;
        },
        activated() {
            this.refresh();
        },
        methods: {
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            createFolder(node, data) {
                this.$router.push({
                    path: '/container/project-folder/folder/create',
                    query: {
                        pid: this.$route.query.pid,
                        defaultFolder: data.oid || this.folderListTreeRef?.currentFolder?.oid,
                        disabled: true
                        // componentRefresh: true
                    }
                });
            },
            onEdit(data) {
                this.$router.push({
                    path: '/space/project-folder/folder/edit',
                    query: {
                        pid: this.$route.query.pid,
                        oid: data.oid,
                        defaultFolder: data.oid
                    }
                });
            },
            onRemove(node, data) {
                this.folderListTreeRef?.onRemove(node, data);
            },
            getIconStyle(data) {
                try {
                    return JSON.parse(data);
                } catch {
                    return data;
                }
            },
            setFormConfig(formConfigList) {
                const formatDataKey = ['FOLDER_FORM', 'FOLDER_MOVE_FORM'];
                _.each(formatDataKey, (key) => {
                    let result = formConfigList[key];
                    _.each(result, (item) => {
                        if (item.field === 'context') {
                            item.label = store.state.projectInfo['templateInfo.tmplTemplated']
                                ? this.i18nMappingObj.projectModule
                                : this.i18nMappingObj.belongProject;
                            item.disabled = true;
                            item.readonly = true;
                        }
                    });
                });
            },
            getActionConfig(row) {
                const classifyMaps = {
                    [this.folderClassName]: 'PROJECT_FOLDER_OPERATE_MENU', // 文件夹操作
                    [this.documentClassName]: 'PROJECT_DOCUMENT_OPERATE_MENU' // 文档操作
                };
                return {
                    name: classifyMaps[row.idKey],
                    objectOid: row.oid,
                    className: row.idKey
                };
            },
            // 打开文档详情
            openDocument({ row }) {
                // 代表是文件夹
                if (row.idKey === this.$store.getters.className('subFolder')) {
                    this.$refs.folderList?.onCheck(row);
                    return;
                }
                this.$router.push({
                    path: '/space/project-folder/document/detail',
                    query: {
                        pid: this.$route.query.pid,
                        oid: row.oid,
                        title: row.name,
                        folderOid: this.folderListDetailRef?.folderObject?.oid
                    }
                });
                // let { containerRef } = this;
                // let extendParams = {
                //     openType: 'detail',
                //     oid: row.oid,
                //     extendParams: { roleType: '' },
                //     beforeCancel: this.refresh,
                //     className: this.documentClassName
                // };
                // commonActions.openDocument(this, { containerRef, extendParams });
            },
            refresh() {
                this.folderListDetailRef?.$refs?.famAdvancedTable?.fnRefreshTable();
                this.folderListDetailRef?.$emit('refresh-tree', { oid: this.folderListDetailRef.oid });
            }
        }
    };
});
