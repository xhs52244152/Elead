define([
    'text!' + ELMP.resource('system-modeling/modeling-type/template.html'),
    'css!' + ELMP.resource('system-modeling/modeling-type/style.css'),
    'erdcloud.kit',
    'underscore',
    'EventBus'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const EventBus = require('EventBus');

    return {
        template,
        components: {
            // 类型管理
            typeManage: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageTree/index.js')),
            TypeManageDetail: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeManageDetail/index.js')),
            // 属性定义
            attrDefined: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/PropertyDefineTree/index.js')),
            PropertyDefineDetail: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/PropertyDefineDetail/index.js')
            ),
            // 数据类型
            dataTypeTree: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/DataTypeTree/index.js')),
            DataTypeDetail: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/DataTypeDetail/index.js')),
            // 测量单位
            UnitMeasureTree: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/UnitMeasureTree/index.js')),
            UnitMeasureDetail: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/UnitMeasureDetail/index.js')),
            AttrPermissionSetting: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/AttrPermissionSetting/index.js')
            ),
            // 全局属性
            GlobalAttributesTree: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/GlobalAttributesTree/index.js')
            ),
            GlobalAttributesDetail: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/GlobalAttributesDetail/index.js')
            ),

            // 拖拽布局
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('system-modeling/modeling-type/locale/index.js'),
                tree: [],
                loading: true,
                treeHeight: '100%',
                activeTab: {
                    name: 'typeManage',
                    left: 'typeManage',
                    right: 'TypeManageDetail'
                },
                tabList: [
                    {
                        name: 'typeManage',
                        refName: 'typeManage',
                        left: 'typeManage',
                        right: 'TypeManageDetail'
                    },
                    {
                        name: 'attrDefined',
                        refName: 'attrDefined',
                        left: 'attrDefined',
                        right: 'PropertyDefineDetail'
                    },
                    {
                        name: 'dataTypeTree',
                        refName: 'dataTypeTree',
                        left: 'dataTypeTree',
                        right: 'DataTypeDetail'
                    },
                    {
                        name: 'UnitMeasureTree',
                        refName: 'UnitMeasureTree',
                        left: 'UnitMeasureTree',
                        right: 'UnitMeasureDetail'
                    },
                    {
                        name: 'GlobalAttributesTree',
                        refName: 'GlobalAttributesTree',
                        left: 'GlobalAttributesTree',
                        right: 'GlobalAttributesDetail'
                    }
                ],
                isSetting: false,
                typeOid: '',
                containerOid: '',
                typeName: '',
                appName: '',
                left: {
                    width: '280px',
                    minWidth: 200,
                    maxWidth: '50%'
                }
            };
        },
        computed: {
            tabsTypeList() {
                return [
                    {
                        label: this.i18n.typeDefinition, // 类型定义
                        name: 'typeManage',
                        icon: 'erd-iconfont erd-icon-type-definition'
                    },
                    {
                        label: this.i18n.featureDefinition, // 特性属性
                        name: 'attrDefined',
                        icon: 'erd-iconfont erd-icon-attr-definition'
                    },
                    {
                        label: this.i18n.dataType, // 数据类型
                        name: 'dataTypeTree',
                        icon: 'erd-iconfont erd-icon-data-type'
                    },
                    {
                        label: this.i18n.unitMeasure, // 测量单位
                        name: 'UnitMeasureTree',
                        icon: 'erd-iconfont erd-icon-measurement-unit'
                    },
                    {
                        label: this.i18n.globalProperty, // 全局属性
                        name: 'GlobalAttributesTree',
                        icon: 'erd-iconfont erd-icon-global-attributes'
                    }
                ];
            },
            queryParams() {
                return {
                    data: {
                        appName: this.appName || '',
                        isGetVirtualRole: false
                    }
                };
            }
        },
        mounted() {
            EventBus.on('updateShowPermissionSettingFlag', this.handlerChangeShow);
        },
        methods: {
            setAppNameByDetail(appName) {
                this.appName = appName;
            },
            typeTreeLoading(loading) {
                this.loading = loading;
            },
            // 点击树查看
            onCheck(data, attr, type) {
                this.fetchTypeInfoId(data, attr, type);
            },
            fetchTypeInfoId(data, attr) {
                const $typeManage = this.$refs?.[attr][0];
                if ($typeManage) {
                    $typeManage.fetchTypeDefById(data);
                }
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
            handlerChangeShow(event, flag, typeOid, containerOid, name) {
                this.isSetting = flag;
                this.typeOid = typeOid;
                this.containerOid = containerOid;
                this.typeName = name;
            },
            globalAttrTreeData(data, attr) {
                const $typeManage = this.$refs[attr][0];
                if ($typeManage) {
                    $typeManage.getGlobalAttrTreeData(data);
                }
            }
        }
    };
});
