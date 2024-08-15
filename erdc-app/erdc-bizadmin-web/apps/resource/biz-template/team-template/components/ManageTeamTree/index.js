/*
    类型基本信息配置
    先引用 kit组件
    ManageTeamTree: ErdcKit.asyncComponent(ELMP.resource('biz-template/team-template/components/ManageTeamTree/index.js')), // 类型基本信息配置


    <manage-team-tree
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </manage-team-tree>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-template/team-template/components/ManageTeamTree/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-template/team-template/components/ManageTeamTree/style.css')
], function (template, fieldTypeMapping) {
    const ErdcKit = require('erdcloud.kit');

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
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-template/team-template/components/ManageTeamTree/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    moreActions: this.getI18nByKey('更多操作'),
                    Import: this.getI18nByKey('导入'),
                    Export: this.getI18nByKey('导出'),
                    manageTeam: this.getI18nByKey('团队模板管理'),
                    createTemplate: this.getI18nByKey('创建团队模板')
                },
                searchValue: '',
                treeHeight: '100%',
                treeList: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList'
                },
                defaultExpandedKeys: [],
                innerVisible: false,
                appName: '',
                importVisible: false,
                exportVisible: false,
                importRequestConfig: {},
                exportRequestConfig: {}
            };
        },
        watch: {
            searchValue(val) {
                this.$refs.tree.filter(val);
            }
        },
        computed: {},
        mounted() {
            this.getTreeList();
        },
        methods: {
            onSubmit() {
                this.refresh();
            },
            /**
             * 刷新树列表
             * @param {*} key 新增/修改的vid,用于回显选中当前树节点
             */
            refresh(key) {
                this.getTreeList(key);
            },
            /**
             * 获取树列表
             * @param {*} key
             */
            getTreeList(key) {
                this.$famHttp({
                    url: '/fam/team/template/getTeamTemplateTree',
                    method: 'get'
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.treeList = data;

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
                        // this.defaultCheckedKeys.push(selectData.key)

                        if (key) {
                            this.$nextTick(() => {
                                this.$refs?.famTree?.$refs.tree?.setCurrentKey(selectData.key);
                            });
                        } else {
                            this.$nextTick(() => {
                                setTimeout(() => {
                                    this.$refs?.famTree?.$refs.tree?.setCurrentKey(selectData.key);
                                    this.$nextTick(() => {
                                        document.querySelector('.is-current')?.firstChild.click();
                                    });
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
                    this.$emit('onsubmit', arg[1].data);
                }
            },
            // 新增团队模板
            onCreate(data) {
                this.appName = data.data.appName;
                this.innerVisible = true;
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
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            onImport(data) {
                const appName = data.data.appName;
                this.importRequestConfig = {
                    data: {
                        customParams: {
                            appName: appName
                        }
                    }
                };
                this.importVisible = true;
            },
            onExport(data) {
                const appName = data.data.appName;
                this.exportRequestConfig = {
                    data: {
                        customParams: {
                            appName: appName
                        }
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.refresh();
            },
            onImportAll() {
                this.importRequestConfig = {};
                this.importVisible = true;
            },
            onExportAll() {
                this.exportRequestConfig = {};
                this.exportVisible = true;
            }
        },
        components: {
            BaseInfoConfig: ErdcKit.asyncComponent(
                ELMP.resource('biz-template/team-template/components/BaseInfoConfig/index.js')
            ), // 类型基本信息配置
            FamTree: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        }
    };
});
