/*
    类型属性配置
    先引用 kit组件
    TypeAttrConfig: FamKit.asyncComponent(ELMP.resource('erdc-product-components/TypeAttrConfig/index.js')), // 编辑子类型

    <type-attr-config
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></type-attr-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-product-components/MainPage/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-product-components/MainPage/style.css')
], function (template, utils) {
    const famHttp = require('fam:http');
    const FamKit = require('fam:kit');

    return {
        inheritAttrs: true,
        template,
        components: {
            FamBoolean: FamKit.asyncComponent(ELMP.resource('erdc-components/FamBoolean/index.js')),
            TypeLayoutForm: FamKit.asyncComponent(ELMP.resource('erdc-product-components/TypeLayoutForm/index.js')),
            ProductForm: FamKit.asyncComponent(ELMP.resource('erdc-product-components/ProductForm/index.js')),
            Object: FamKit.asyncComponent(ELMP.resource('erdc-product-components/Object/index.js')),
            Team: FamKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        props: {
            productOid: {
                type: String,
                default: ''
            }
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
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    attr: this.getI18nByKey('属性'),
                    obj: this.getI18nByKey('相关对象'),
                    team: this.getI18nByKey('团队'),
                    module: this.getI18nByKey('模块'),
                    tabTitle: this.getI18nByKey('增加TAB模块')
                },
                list: [
                    {
                        key: 'link1',
                        name: '操作' + 1
                    },
                    {
                        key: 'link2',
                        name: '操作' + 2
                    },
                    {
                        key: 'link3',
                        name: '操作' + 3
                    }
                ],
                user: {
                    displayName: '张三',
                    orgName: '修改者',
                    time: '2022-04-23 15:23:12',
                    updateTime: '更新时间',
                    orgId: 'REQ202203343535',
                    team: '团队'
                },
                tabList: [
                    {
                        name: 'Attr',
                        refName: 'Attr'
                    },
                    // {
                    //     name: 'Object',
                    //     refName: 'Object',
                    // },
                    {
                        name: 'Team',
                        refName: 'Team'
                    }
                ],
                productInfo: [],
                changeNew: false, // 转至最新
                isMeCheckOut: false,
                editTabs: false,
                title: '部件 - P20220622000023, 123456, A.1 (设计)',
                version: 'A.2',
                editor: '已被 您 编辑',
                activeName: 'Team',
                editableTabs: [],
                tabTitle: '',
                innerVisible: false,
                tabSelected: [],
                selectList: [
                    {
                        label: '团队11',
                        value: '1'
                    },
                    {
                        label: '团队22',
                        value: '2'
                    }
                ],
                // 表单设计器传参
                layoutForm: {
                    // 是否显示
                    visible: false,
                    // 布局id
                    layoutId: null,
                    // 是否只读
                    readonly: false
                },
                width: 254,
                oid: 'OR:erd.cloud.foundation.type.entity.TypeDefinition:27150207405816987'
            };
        },
        watch: {
            productOid(n, o) {
                if (n) {
                    this.getDetail();
                    // 触发产品里的tabs数据更新
                    let activeName = this.$refs[this.activeName];
                    if (activeName[0] && activeName[0].init) {
                        activeName[0].init();
                    }
                }
            }
        },
        mounted() {
            if (this.productOid) {
                this.getDetail();
            }

            let tableName = 'admin';
            this.editor = utils.setTextBySysLanguage({
                CN: `已被【${tableName}】编辑`,
                EN: ` has been edited by [${tableName}]?`
            });
            this.tabTitle = this.i18nMappingObj.tabTitle;
            this.editableTabs = [
                {
                    title: this.i18nMappingObj['attr'],
                    name: 'Attr',
                    content: 'Tab 1 content',
                    closable: false
                },
                //   {
                //     title: this.i18nMappingObj['obj'],
                //     name: 'Object',
                //     content: 'Tab 2 content',
                //       closable: false
                //   },
                {
                    title: this.i18nMappingObj['team'],
                    name: 'Team',
                    content: 'Tab 2 content',
                    closable: false
                }
            ];
        },
        methods: {
            getDetail() {
                this.$famHttp({
                    url: '/fam/attr',
                    data: {
                        oid: this.productOid
                    },
                    method: 'get'
                })
                    .then((res) => {
                        this.productInfo = res?.data;
                    })
                    .catch((err) => {
                        // this.$message.error(err?.data?.message)
                    });
            },
            changeToNew() {},
            onEdit() {},
            handleClick(tab) {},
            openEdit() {
                this.editTabs = true;
                this.$nextTick(() => {
                    this.width = $('.el-tabs--card>.el-tabs__header .el-tabs__nav').width() + 20;
                    $('.add_tabs').css('left', this.width + 'px');
                });
            },
            selectTab() {},
            saveTabs() {
                this.editTabs = false;
            },
            // 增加tabs页
            addTab(targetName) {
                // this.innerVisible = true;
                let newTabName = ++this.tabIndex + '';
                this.editableTabs.push({
                    title: 'New Tab',
                    name: newTabName,
                    content: 'New Tab content',
                    closable: true
                });
                this.editableTabsValue = newTabName;
                this.$nextTick(() => {
                    this.width += 100;
                    $('.add_tabs').css('left', this.width + 'px');
                });
            },
            removeTab(targetName) {
                let tabs = this.editableTabs;
                let activeName = this.editableTabsValue;
                if (activeName === targetName) {
                    tabs.forEach((tab, index) => {
                        if (tab.name === targetName) {
                            let nextTab = tabs[index + 1] || tabs[index - 1];
                            if (nextTab) {
                                activeName = nextTab.name;
                            }
                        }
                    });
                }

                this.editableTabsValue = activeName;
                this.editableTabs = tabs.filter((tab) => tab.name !== targetName);
            },
            saveSubmit() {},
            toggleShow() {}
        }
    };
});
