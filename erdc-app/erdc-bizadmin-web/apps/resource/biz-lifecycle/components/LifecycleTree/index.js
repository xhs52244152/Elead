/*
    类型基本信息配置
    先引用 kit组件
    LifecycleTree: FamKit.asyncComponent(ELMP.resource('biz-lifecycle/components/LifecycleTree/index.js')), // 类型基本信息配置


    <lifecycle-tree
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </lifecycle-tree>

    返回参数

 */
define([
    'erdc-kit',
    'text!' + ELMP.resource('biz-lifecycle/components/LifecycleTree/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('biz-lifecycle/components/LifecycleTree/style.css')
], function (ErdcKit, template, fieldTypeMapping) {
    return {
        template,
        components: {
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js'))
        },
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
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/LifecycleTree/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    lifecycle: this.getI18nByKey('生命周期'),
                    moreActions: this.getI18nByKey('更多操作'),
                    Import: this.getI18nByKey('导入'),
                    Export: this.getI18nByKey('导出'),
                    stateManagement: this.getI18nByKey('状态管理')
                },
                searchValue: '',
                treeHeight: '100%',
                treeList: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList'
                },
                defaultExpandedKeys: [],
                createState: false,
                importVisible: false,
                className: 'erd.cloud.foundation.lifecycle.entity.LifecycleTemplate',
                importRequestConfig: {
                    data: {
                        tableSearchDto: {
                            className: 'erd.cloud.foundation.lifecycle.entity.LifecycleTemplate'
                        }
                    }
                }
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
            this.treeHeight = `calc(100% - ${ErdcKit.offset(this.$refs.treeSplit).top - 16 - 12}px)`;
            this.createState = this.$route.query.type === 'createState';
            // 移除vue-router的query参数
            this.$router.replace({
                path: this.$route.path,
                query: {}
            });
            this.getTreeList();
        },
        methods: {
            refresh(key, type) {
                this.getTreeList(key, type);
            },
            getTreeList(key, type) {
                this.$famHttp({
                    url: '/fam/lifecycle/template/list',
                    method: 'get'
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.treeList = data;
                        this.initIcons(data);

                        let selectData = {};
                        let expandData = {};

                        for (let i = 0; i < data.length; i++) {
                            if (data[i].childList && data[i].childList.length) {
                                if (key) {
                                    data[i].childList.forEach((item) => {
                                        if (item.key == key) {
                                            selectData = item;
                                            expandData = data[i];
                                        }
                                    });
                                } else {
                                    selectData = data[i].childList[0];
                                    expandData = data[i];
                                    break;
                                }
                            }
                        }
                        this.defaultExpandedKeys.push(expandData.key);
                        this.defaultExpandedKeys = _.uniq(this.defaultExpandedKeys);
                        // this.defaultCheckedKeys.push(selectData.key)

                        // 如果是从状态管理进来的，则不触发进入生命周期详情页面
                        if (this.createState) {
                            return;
                        }
                        if (key) {
                            this.$nextTick(() => {
                                this.$refs.tree?.setCurrentKey(selectData.key);
                                if (type === 'create') {
                                    this.$emit('onsubmit', selectData, 'check', 'tree');
                                }
                            });
                        } else {
                            this.$nextTick(() => {
                                setTimeout(() => {
                                    // 后续讨论优化方案
                                    if (_.isEmpty(selectData)) {
                                        this.$emit('onsubmit', { isEmpty: true }, 'create');
                                    } else {
                                        this.$refs.tree?.setCurrentKey(selectData.key);
                                        this.$nextTick(() => {
                                            // document.querySelector('.is-current')?.firstChild?.click();
                                            this.$emit('onsubmit', selectData, 'check', 'tree');
                                        });
                                    }
                                }, 100);
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            /**
             * 搜索过滤
             * @param {*} value
             * @param {*} data
             * @returns
             */
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            /**
             * 查看详情
             * @param  {...any} arg
             */
            onCheck(...arg) {
                if (arg[1].level != 1) {
                    this.$emit('onsubmit', arg[1].data, 'check', 'tree');
                }
            },
            /**
             * 状态管理
             */
            onStateManagement() {
                this.$emit('clickstate');
            },
            /**
             * 创建生命周期
             * @param {*} node
             */
            onCreate(node) {
                const { data } = node || [];
                this.$emit('onsubmit', { appName: data.appName }, 'create');
            },
            /**
             * 更多操作
             * @param {*} type
             */
            onCommand(type) {
                if (type === 'import') {
                    this.onImportAll();
                }
                if (type === 'export') {
                    this.onExportAll();
                }
            },
            /**
             * 导出
             */
            onExportAll() {
                this.$famHttp({
                    url: '/fam/export',
                    method: 'POST',
                    data: {
                        businessName: 'LifecycleTemplateExport',
                        tableSearchDto: {
                            className: this.className
                        }
                    }
                }).then(() => {
                    this.$message({
                        type: 'success',
                        dangerouslyUseHTMLString: true,
                        message: this.i18n.exporting,
                        showClose: true
                    });
                });
            },
            /**
             * 导入
             */
            onImportAll() {
                this.importVisible = true;
            },
            onImportSuccess() {
                this.importVisible = false;
                this.refresh();
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            nodeExpand(data) {
                this.defaultExpandedKeys.push(data.key);
                this.defaultExpandedKeys = _.uniq(this.defaultExpandedKeys);
            },
            nodeCollapse(data) {
                this.defaultExpandedKeys = this.defaultExpandedKeys
                    .map((key) => key !== data.key)
                    .filter((item) => item);
            },
            initIcons(applications) {
                if (applications) {
                    applications.forEach((app) => {
                        app.icon && (app.icon = ErdcKit.imgUrlCreator(app.icon));
                    });
                }
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            }
        }
    };
});
