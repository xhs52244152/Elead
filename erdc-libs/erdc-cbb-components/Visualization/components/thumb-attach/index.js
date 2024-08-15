define([
    'text!' + ELMP.resource('erdc-cbb-components/Visualization/components/thumb-attach/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, ErdcKit, cbbUtils) {
    return {
        template,
        props: {
            visible: Boolean
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/Visualization/locale/index.js'),
                tableData: [],
                unfold: true,
                rowData: {}
            };
        },
        computed: {
            dataVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            className() {
                return 'erd.cloud.pdm.epm.entity.EpmDocument';
            },
            columns() {
                let { i18n } = this;
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'displayName',
                        title: i18n.name
                    },
                    {
                        prop: 'size',
                        title: i18n.fileSize,
                        width: 100
                    },
                    {
                        prop: 'standardIconStr',
                        title: i18n.type,
                        width: 60
                    },
                    {
                        prop: 'createTime',
                        title: i18n.createTime,
                        width: 140
                    },
                    {
                        prop: 'updateTime',
                        title: i18n.updateTime,
                        width: 140
                    },
                    {
                        prop: 'operation',
                        title: i18n.operation,
                        width: 100
                    }
                ];
            }
        },
        watch: {
            visible: {
                immediate: true,
                handler(val) {
                    this.dataVisible = val;
                    if (val) {
                        // 初始数据加载
                        this.getAttachmentList();
                    }
                }
            }
        },
        methods: {
            getAttachmentList() {
                this.tableData = (this.rowData.attachmentDataList || []).map((item) => {
                    return {
                        ...item,
                        standardIconStr: item.displayName?.split('.')?.slice(-1)?.[0]
                    };
                });
            },
            setRowData(row) {
                this.rowData = row || {};
            },
            // getActionConfig(data) {
            //     return {
            //         name: 'FILE_LIST_PER_OP_MENU',
            //         objectOid: 'OR:erd.cloud.pdm.epm.entity.EpmDocument:1749970811851800578',
            //         className: 'erd.cloud.pdm.epm.entity.EpmDocument'
            //     };
            // },
            // onCommand(action, row) {
            //     let actionConfig = {
            //         FILE_PREVIEW: this.previewAttach,
            //         FILE_DOWNLOAD: this.downLoad
            //     };

            //     actionConfig[action.name] && actionConfig[action.name](row);
            // },
            getSizeDisplayName(size) {
                return cbbUtils.formatSize(size);
            },
            async previewAttach(row) {
                let { i18n, isNdsSupported } = this;
                // 判断预览方式：新迪插件预览、工具端预览、平台通用预览
                // 1.新迪插件预览
                if (isNdsSupported(row)) {
                    return this.NDSWebPreview();
                }
                // 2.工具端
                if (['THUMBNAIL3D', 'THUMBNAIL'].includes(row.role)) {
                    var oid = this.rowData.oid; // 取表示法的oid
                    var role = row.role;
                    return cbbUtils.handleClientCAD('PREVIEW', oid, role, 'W');
                }
                // 3.平台通用预览
                let isSupportedByPlat = await this.$refs.filePreview.isSupportedView(row.displayName);
                if (isSupportedByPlat) {
                    return this.$refs.filePreview.preview({
                        fileName: row.displayName,
                        oid: this.rowData.oid,
                        contentId: row.id
                    });
                } else {
                    this.$message(i18n.noSupported);
                }
            },
            isNdsSupported(row) {
                return row.displayName === 'model.js' || row._taskType === 'NDS';
            },
            // todo 新迪预览
            NDSWebPreview() {},
            downLoad(row) {
                let { className } = this;
                let { id, name } = row;
                let downloadUrl = '/fam/content/file/download';

                ErdcKit.downFile({
                    url: downloadUrl,
                    mehod: 'GET',
                    data: {
                        id,
                        name,
                        className
                    }
                });
            },
            // 自定义按钮禁用逻辑
            extendDisabledValidate(item, row) {
                // 老版本逻辑
                var type = row.displayName.split('.').slice(-1)[0];
                return ['catpart'].indexOf(type) > -1 ? false : item.enabled;
            }
        }
    };
});
