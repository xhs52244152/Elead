define([
    'text!' + ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/template.html'),
    ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/getTabList.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/style.css'),
    'erdc-kit',
    'EventBus',
    'erdcloud.kit',
    'fam:http',
    'underscore'
], function (template, getTabList) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

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
            currentMenu: {
                type: String,
                default: 'Products'
            },
            className: {
                type: String,
                default: 'erd.cloud.cbb.review.entity.ReviewCategory'
            },
            useForm: {
                type: String,
                default: 'type'
            },
            layoutName: {
                type: String,
                default: 'DETAIL'
            },
            tabListData: {
                type: Array,
                default: () => []
            },

            treeDetail: {
                type: Object,
                default: () => {}
            },
            showTab: {
                type: Boolean,
                default: true
            },
            // 点击树是否将tab跳回默认页签
            resettingActiveTab: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    basicInformation: this.getI18nByKey('详情信息'),
                    roleMembers: this.getI18nByKey('角色成员'),
                    relativeTeam: this.getI18nByKey('关联团队'),

                    reviewElements: this.getI18nByKey('评审要素'),
                    qualityObjectives: this.getI18nByKey('质量目标'),
                    deliverables: this.getI18nByKey('交付件清单'),

                    icon: this.getI18nByKey('图标'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择')
                },
                typeOid: null,
                hasModify: true,
                // activeTab: {
                //     name: 'basicInformation',
                //     detail: 'TypeManageBasicInfo'
                // },
                formData: {},
                moduleTitle: '',

                idKey: '',
                initActiveTab: ErdcKit.deepClone(this.activeTab),
                tabLists: []
            };
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),

            // TypeManageBasicInfo: ErdcKit.asyncComponent(
            //     ELMP.resource('erdc-type-components/TypeManageBasicInfo/index.js')
            // ), // 基本信息
            TypeManageBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/SystemDefineBasic/index.js')
            ), // 基本信息

            RelativeTeam: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-products/components/RelativeTeam/index.js')), // 管理团队
            RoleMembers: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-heavy-team/components/RoleMembers/index.js')), // 角色成员

            ReviewElements: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/reviewElements/index.js')
            ), // 评审要素
            Deliverables: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/deliverables/index.js')
            ), // 交付件清单
            QualityObjectives: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/qualityObjectives/index.js')
            ) // 质量目标
        },
        computed: {
            // tabLists: {
            //     get() {
            //         if (this.tabList && this.tabList.length) {
            //             return this.tabList;
            //         }
            //         return getTabList(this.currentMenu);
            //     },
            //     set() {}
            // }
        },
        watch: {
            treeDetail(val) {
                this.moduleTitle = val.path || val.name;
                this.typeOid = val.oid;
                this.getTabList();
            },
            immediate: true
        },
        mounted() {},
        methods: {
            getTabList() {
                // 重新将tab重置到第一个(默认)
                if (this.resettingActiveTab) {
                    this.initActiveTab = ErdcKit.deepClone(this.activeTab);
                }
                if (this.tabList && this.tabList.length) {
                    this.tabLists = this.tabList;
                    return;
                }

                let show = true;
                if (this.currentMenu === 'Products') {
                    show = this.treeDetail?.category === 'Product_name' ? true : false;
                    if (!show) this.initActiveTab = ErdcKit.deepClone(this.activeTab);
                }
                this.tabLists = getTabList(this.currentMenu, show);
            },
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
            refreshBasic() {
                const $typeManage = this.$refs?.['basicInformation'] && this.$refs?.['basicInformation'][0];
                if ($typeManage) {
                    $typeManage.refresh();
                }
            },
            handleEdit(val) {
                this.$emit('edit-data', val);
            },
            fetchTypeDefById(typeData) {
                // 【类型管理】当创建属性按钮置灰时，则同时隐藏布局、属性组、属性权限配置、权限
                let { typeManaged, hasLayout, hasAttrGroup } = typeData;
                const tableListMap = {
                    operate: 'hasAction',
                    propertyGroup: 'hasAttrGroup',
                    attributes: 'hasAttribute',
                    layout: 'hasLayout'
                };

                // 布局、属性组
                const filterName = ['layout', 'propertyGroup'];
                this.tabLists.forEach((item) => {
                    const typeName = tableListMap[item.name];
                    let isShow = typeData[typeName] ?? true;
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
                this.hasModify = typeData.hasModify;
                let orgId = typeData.oid;
                this.idKey = typeData?.idKey || '';
                this.moduleTitle = typeData?.displayName || typeData?.typeName || '';
                if (orgId) {
                    this.typeOid = orgId;
                    this.refreshForm(orgId);
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
            },
            // 调用子组件刷新
            refreshForm(oid) {
                this.$nextTick(() => {
                    const $typeManage = this.$refs?.['basicInformation'] && this.$refs?.['basicInformation'][0];
                    if ($typeManage) {
                        $typeManage.fetchTypeDefById(oid);
                    }
                });
            }
        }
    };
});
