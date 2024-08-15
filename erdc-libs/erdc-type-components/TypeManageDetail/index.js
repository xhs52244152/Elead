define([
    'text!' + ELMP.resource('erdc-type-components/TypeManageDetail/template.html'),
    ELMP.resource('erdc-type-components/TypeManageDetail/getTabList.js'),
    'css!' + ELMP.resource('erdc-type-components/TypeManageDetail/style.css'),
    'erdc-kit',
    'EventBus',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function (template, getTabList) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            // 页签列表
            tabList: {
                type: Array | Object,
                default: () => {
                    return [];
                }
            },
            // 初始化显示高亮 tab
            activeTab: {
                type: Object,
                default: () => {
                    return {
                        name: 'basicInformation',
                        components: [
                            {
                                refName: 'basicInformation',
                                detail: 'TypeManageBasicInfo'
                            }
                        ]
                    };
                }
            },
            //图标
            isIcon: {
                type: String,
                default: 'erd-iconfont erd-icon-server'
            },
            useForm: {
                type: String,
                default: 'type'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeManageDetail/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    editTypeManagement: this.getI18nByKey('编辑类型'),
                    basicInformation: this.getI18nByKey('定义信息'),
                    attributes: this.getI18nByKey('属性信息'),
                    operate: this.getI18nByKey('操作'),
                    layout: this.getI18nByKey('布局'),
                    propertyGroup: this.getI18nByKey('属性组'),
                    internalName: this.getI18nByKey('内部名称'),
                    showName: this.getI18nByKey('显示名称'),
                    icon: this.getI18nByKey('图标'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    signatureRule: this.getI18nByKey('签名规则')
                },
                typeOid: null,
                typeName: '',
                hasModify: true,
                // activeTab: {
                //     name: 'basicInformation',
                //     detail: 'TypeManageBasicInfo'
                // },
                moduleTitle: '',
                // isIcon: 'erd-iconfont erd-icon-server',
                typeMap: {
                    ServiceInfo: 'erd.cloud.foundation.tenant.entity.ServiceInfo',
                    TypeDefinition: 'erd.cloud.foundation.type.entity.TypeDefinition'
                },
                idKey: '',
                initActiveTab: ErdcKit.deepClone(this.activeTab)
            };
        },
        components: {
            TypeManageBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/TypeManageBasicInfo/index.js')
            ), // 基本信息
            TypeManageAttr: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageAttr/index.js')), // 属性
            TypeManageOperate: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageOperate/index.js')), // 操作
            TypeManageLayout: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageLayout/index.js')), // 布局
            TypeManageAttrGroup: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/TypeManageAttrGroup/index.js')
            ), // 属性组
            TypeManageSignRule: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/TypeManageSignRule/index.js')
            ) // 签名规则
        },
        computed: {
            tabLists: {
                get() {
                    if (this.tabList && this.tabList.length) {
                        return this.tabList;
                    }
                    return getTabList('TypeDefinition');
                },
                set() {}
            }
        },
        methods: {
            setAppName(appName) {
                this.$emit('set-app-name-by-detail', appName);
            },
            activeChange(val) {
                const newTabList = JSON.parse(JSON.stringify(this.tabLists));
                newTabList.forEach((item) => {
                    if (item.name === val.name) {
                        this.initActiveTab = item;
                    }
                });
            },
            onSubmit(oid) {
                this.$emit('refresh-tree', oid, 'init');
                this.fetchTypeDefById({
                    oid,
                    hasModify: this.hasModify
                });
            },
            fetchTypeDefById(typeData) {
                // 【类型管理】当创建属性按钮置灰时，则同时隐藏布局、属性组、属性权限配置、权限
                let { typeManaged, hasLayout, hasAttrGroup, oid, idKey, typeName, displayName, hasModify } = typeData;
                const tableListMap = {
                    operate: 'hasAction',
                    propertyGroup: 'hasAttrGroup',
                    attributes: 'hasAttribute',
                    layout: 'hasLayout',
                    signatureRule: 'hasSignatureRule'
                };

                // 布局、属性组
                const filterName = ['layout', 'propertyGroup'];
                this.tabLists.forEach((item) => {
                    const tempTypeName = tableListMap[item.name];
                    let isShow = typeData[tempTypeName] ?? true;
                    if (filterName.includes(item.name) && !_.isEmpty(typeData) && this.useForm === 'type' && isShow) {
                        if (item.name === 'layout') {
                            isShow = typeManaged || hasLayout;
                        }
                        if (item.name === 'propertyGroup') {
                            isShow = typeManaged || hasAttrGroup;
                        }
                    }
                    item.isShow = isShow;
                });
                this.hasModify = hasModify;
                this.idKey = idKey || '';
                this.moduleTitle = displayName || typeName || '';
                if (oid) {
                    this.typeOid = oid;
                    this.typeName = typeName;
                    // this.refreshForm(oid);
                }
                // 解决点击应用时，没有页签而导致页签无法正常显示的问题
                if (
                    !this.tabLists
                        .filter((item) => item.isShow)
                        .map((item) => item.name)
                        .includes(this.initActiveTab.name)
                ) {
                    this.initActiveTab = ErdcKit.deepClone(this.activeTab);
                }
            }
        }
    };
});
