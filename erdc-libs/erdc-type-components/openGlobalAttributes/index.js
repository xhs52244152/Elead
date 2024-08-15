define([
    'text!' + ELMP.resource('erdc-type-components/openGlobalAttributes/template.html'),
    'css!' + ELMP.resource('erdc-type-components/openGlobalAttributes/style.css'),
    'erdcloud.kit',
    'underscore',
    'EventBus'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const EventBus = require('EventBus');

    return {
        template,
        data() {
            return {
                tree: [],
                loading: true,
                activeTab: {
                    name: 'GlobalAttributesTree',
                    left: 'GlobalAttributesTree',
                    right: 'GlobalAttributesDetail'
                },
                tabList: [
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
                typeName: ''
            };
        },
        components: {
            // 全局属性
            GlobalAttributesTree: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/GlobalAttributesTree/index.js')
            ),
            GlobalAttributesDetail: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/GlobalAttributesDetail/index.js')
            ),

            // 拖拽布局
            ResizableContainer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamResizableContainer/index.js')
            )
        },
        mounted() {
            this.$on('type-tree-loading');
            EventBus.on('updateShowPermissionSettingFlag', this.handlerChangeShow);
        },
        methods: {
            typeTreeLoading(loading) {
                

                this.loading = loading;
            },
            onCheck(data, attr) {
                this.fetchTypeInfoId(data, attr);
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
            onChangeRadio(data) {
                this.$emit('setBtnDisabled', data);
            }
        }
    };
});
