/*
    类型基本信息配置
    先引用 kit组件
    BasicInforConfig: FamKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')), // 类型基本信息配置


    <basic-infor-config
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </basic-infor-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-dict/components/DictTree/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('biz-dict/components/DictTree/style.css')
], function (template, fieldTypeMapping) {
    const FamKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        components: {
            DictForm: FamKit.asyncComponent(ELMP.resource('biz-dict/components/DictForm/index.js')),
            FamTree: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js')),
            FamImport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: FamKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-dict/components/DictTree/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    dataItem: this.getI18nByKey('数据项'),
                    pleaseEnter: this.getI18nByKey('请输入关键字'),
                    createItem: this.getI18nByKey('创建项'),
                    editItem: this.getI18nByKey('编辑项'),
                    whetherDeleteItems: this.getI18nByKey('是否删除数据项'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    deletedSuccessfully: this.getI18nByKey('删除成功'),
                    deleteDailed: this.getI18nByKey('删除失败')
                },
                searchValue: '',
                treeData: [],
                defaultProps: {
                    children: 'childList',
                    label: 'displayName',
                    isLeaf: 'leaf'
                },
                draggable: false,
                treeHeight: '100%',
                defaultExpandedKeys: [],
                visibleDictForm: false,
                dictData: {},
                title: '',
                oid: '',
                basicsListData: [],
                selectNodeKey: '',
                selectNode: {},
                importVisible: false,
                exportVisible: false
            };
        },
        watch: {
            searchValue(val) {
                this.$refs.tree.filter(val);
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            }
        },
        mounted() {
            // if (this.$refs.header.clientHeight) {
            //     this.treeHeight = `calc(100vh - ${this.$refs.header.clientHeight + 152}px)`;
            // }
            this.getDictTree();
        },
        methods: {
            edit(scope) {
            },
            getDictTree(oid) {
                this.$famHttp({
                    url: '/fam/listAllTree',
                    data: {
                        className: 'erd.cloud.foundation.core.dictionary.entity.DictionaryItem'
                    },
                    method: 'get',
                    headers: {
                        'App-Name': 'ALL'
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.treeData = data;
                        this.basicsListData = JSON.parse(JSON.stringify(data));

                        let selectData = {};
                        let expandData = [];

                        this.treeData.forEach((item) => {
                            if (item.childList && item.childList.length) {
                                item.childList.forEach((ite) => {
                                    if (ite.oid === oid) {
                                        selectData = ite;
                                        expandData.push(ite);
                                    }
                                });
                            }
                        });
                        this.$nextTick(() => {
                            if (oid) {
                                this.$refs?.famTree?.$refs?.tree?.setCurrentKey(selectData.oid);
                                this.$emit('onclick', selectData);
                            } else {
                                const firstData = this.treeData.find((item) => {
                                    return !_.isEmpty(item.childList);
                                });
                                this.defaultExpandedKeys.push(firstData.oid);
                                setTimeout(() => {
                                    this.$refs?.famTree?.$refs.tree?.setCurrentKey(
                                        firstData?.childList?.[0]?.oid || ''
                                    );
                                    this.$nextTick(() => {
                                        document.querySelector('.is-current')?.firstChild?.click();
                                    });
                                }, 300);
                            }
                            this.defaultExpandedKeys.push(...expandData.map((item) => item.oid));
                            if (this.searchValue) {
                                this.onSearch();
                            }
                        });
                    })
                    .catch((error) => {
                        console.error(error)
                    });
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            nodeClick(data, node, e, flag) {
                // 如果是关闭，则不触发点击事件
                if (flag) {
                    return;
                }
                if (node.level == 1) {
                    // if (data.childList && data.childList.length > 0) {
                    //     this.$emit('onclick', data.childList[0], node.childNodes[0])
                    //     this.$refs.tree?.setCurrentKey(data.childList[0]?.key || '');
                    // }
                    this.$nextTick(() => {
                        this.$refs?.famTree?.$refs.tree?.setCurrentKey(this.selectNodeKey);
                    });
                } else {
                    this.selectNodeKey = data.key;
                    this.$emit('onclick', data, node);
                }
            },
            nodeExpand(data, node, e) {
                // this.$nextTick(() => {
                //     this.nodeClick(data.childList[0], node.childNodes[0], e)
                //     this.$refs.tree?.setCurrentKey(data.childList[0]?.key || '');
                // })
            },
            nodeCollapse(data, node, e) {
                // this.$nextTick(() => {
                //     this.nodeClick(data.childList[0], node.childNodes[0], e, true)
                //     this.$refs.tree?.setCurrentKey(data.childList[0]?.key || '');
                // })
            },
            onCreate(scope) {
                this.visibleDictForm = true;
                const { data } = scope;
                this.dictData = data;
                this.oid = '';
                this.title = this.i18nMappingObj.createItem;
            },
            onEdit(scope) {
                this.visibleDictForm = true;
                const { data } = scope;
                this.dictData = data;
                this.oid = data.oid || '';
                this.title = this.i18nMappingObj.editItem;
            },
            onDelete(scope) {
                const { data } = scope;
                if (data.oid) {
                    this.$confirm(this.i18nMappingObj['whetherDeleteItems'], this.i18nMappingObj['confirmDelete'], {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    })
                        .then(() => {
                            this.$famHttp({
                                url: '/fam/delete',
                                method: 'DELETE',
                                params: {
                                    oid: data.oid
                                }
                            })
                                .then((resp) => {
                                    this.getDictTree();
                                    this.$message({
                                        type: 'success',
                                        message: this.i18nMappingObj['deletedSuccessfully'],
                                        showClose: true
                                    });
                                })
                                .catch((error) => {
                                    console.error(error)
                                    // this.$message({
                                    //     type: 'error',
                                    //     message: error?.data?.message || this.i18nMappingObj['deleteDailed'],
                                    //     showClose: true
                                    // });
                                });
                        })
                        .catch(() => {});
                }
            },
            onSubmit(data) {
                // 刷新列表
                this.getDictTree(data.oid);
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                return data.name && data.name.indexOf(value) !== -1;
            },
            onSearch() {
                this.$refs.tree.filter(this.searchValue);
            },
            onImport() {
                this.importVisible = true;
            },
            onExport() {
                this.exportVisible = true;
            },
            importSuccess() {
                this.getDictTree();
            }
        }
    };
});
