define([
    'text!' + ELMP.resource('erdc-pdm-components/ContainerFolder/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ContainerFolder',
        template,
        components: {
            FolderList: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/FolderList/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            // 文件夹按钮对象
            folderMapping: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            className: String
        },
        data() {
            return {
                // 实例本身
                vm: this,
                // 当前选中文件夹对象
                currentFolderObject: {},
                currentFolder: {},
                initFolderMounted: false
            };
        },
        computed: {
            // 上下文id
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            // 文件夹组件props
            bindFolderInfo() {
                return {
                    containerRef: this.containerRef,
                    className: this.className,
                    toolbarOperationType: this.folderMapping?.actionToolBarName || '',
                    rowOperationType: this.folderMapping?.actionTableName || '',
                    vm: this.vm,
                    slotsField: [
                        {
                            prop: 'identifierNo', // 字段名
                            type: 'default' // 头部文本插槽
                        }
                    ]
                };
            },
            // FolderList实例
            folderListRef() {
                return this.$refs?.folderListRef || {};
            },
            // 左侧树实例
            folderListTreeRef() {
                let [folderListTreeRef] = this.folderListRef?.$refs?.FolderListTree || [{}];
                return folderListTreeRef;
            },
            // 右侧表格实例
            folderListDetailRef() {
                let [FolderListDetail] = this.folderListRef?.$refs?.FolderListDetail || [{}];
                return FolderListDetail;
            },
            // 插槽名称
            slotName() {
                return {
                    name: 'column:default:name',
                    displayName: 'column:default:displayName',
                    identifierNo: 'column:default:identifierNo:content',
                    icon: 'column:default:icon'
                };
            },
            initFolder() {
                return this.initFolderMounted && this.$route.query?.folderId;
            }
        },
        watch: {
            initFolder: {
                handler(nv) {
                    if (nv) {
                        const { folderId, displayName = '' } = this.$route.query || {};
                        this.currentFolder = { oid: folderId, displayName: displayName || '' };
                        this.$refs.folderListRef.currentFolder = this.currentFolder;
                    }
                },
                immediate: true
            }
        },
        methods: {
            handleRowLink(row) {
                if (row.typeName === this.$store.getters.className('subFolder')) {
                    this.$refs?.folderListRef?.onCheck(row);
                } else {
                    this.onDetail(row);
                }
            },
            // 过滤文件夹表格数据
            handlerData(tableData, callback) {
                if (this.className) {
                    tableData = _.filter(tableData, (item) => item.typeName !== this.className);
                }
                callback(tableData);
            },
            nodeFolderClick(data) {
                this.currentFolderObject = data;
            },
            // 查看详情
            onDetail(row) {
                if(!row.accessToView) return;
                return cbbUtils.goToDetail(row, {
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        })
                    }
                });
            },
            refreshTree(...args) {
                this.$refs?.folderListRef?.refreshTree(...args);
            }
        }
    };
});
