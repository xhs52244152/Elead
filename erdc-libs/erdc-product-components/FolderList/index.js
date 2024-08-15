/*
    类型属性配置
    先引用 kit组件
    FolderList: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderList/index.js')),

    <folder-list
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></folder-list>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-product-components/FolderList/index.html'),
    'css!' + ELMP.resource('erdc-product-components/FolderList/style.css')
], function(template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            containerRef: String,
            toolbarOperationType: {
                type: String,
                default: ''
            },
            rowOperationType: {
                type: String,
                default: ''
            },
            vm: {
                type: Object,
                default() {
                    return null;
                }
            },
            slotsField: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        components: {
            // 全局属性
            FolderListTree: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListTree/index.js')),
            FolderListDetail: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListDetail/index.js')),
            // 拖拽布局
            ResizableContainer: FamKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    new: this.getI18nByKey('转至最新'),
                    action: this.getI18nByKey('更多操作'),
                    edit: this.getI18nByKey('编辑'),
                    add: this.getI18nByKey('增加'),
                    save: this.getI18nByKey('保存'),
                    delete: this.getI18nByKey('删除'),
                    attr: this.getI18nByKey('属性'),
                    obj: this.getI18nByKey('相关对象'),
                    team: this.getI18nByKey('团队')
                },
                tree: [],
                loading: true,
                treeHeight: '100%',
                activeTab: {
                    name: 'FolderListTree',
                    refName: 'FolderListTree',
                    left: 'FolderListTree',
                    right: 'FolderListDetail'
                },
                tabList: [
                    {
                        name: 'FolderListTree',
                        refName: 'FolderListDetail',
                        left: 'FolderListTree',
                        right: 'FolderListDetail'
                    }
                ],
                isSetting: false,
                typeOid: '',
                containerOid: '',
                typeName: '',
                currentFolder: null
            };
        },
        computed: {
            breadLabel() {
                return this.currentFolder?.displayName || this.currentFolder?.name || '--';
            }
        },
        methods: {
            typeTreeLoading(loading) {
                this.loading = loading;
            },
            onCheck(data) {
                this.currentFolder = data;
            },
            activeChange(val) {
                const newTabList = JSON.parse(JSON.stringify(this.tabList));
                newTabList.forEach((item) => {
                    if (item.name === val.name) {
                        this.activeTab = item;
                    }
                });
            },
            onSubmit(val, attr) {
                const $typeManage = this.$refs[attr][0];
                if ($typeManage) {
                    $typeManage.getListTree(val);
                }
            },
            /**
             * 刷新树列表
             * @param {*} data 刷新列表的数据
             * @param {*} methodName 刷新树列表的方法
             * @param {*} attr 需要刷新的树列表的ref名称
             */
            refreshTree(data, methodName, attr) {
                const $typeManage = this.$refs[attr][0];
                methodName = methodName || 'getListTree';
                if ($typeManage) {
                    $typeManage?.[methodName](data);
                }
            },
            refreshTable() {
                this.$refs.FolderListDetail?.[0]?.refresh();
            }
        }
    };
});
