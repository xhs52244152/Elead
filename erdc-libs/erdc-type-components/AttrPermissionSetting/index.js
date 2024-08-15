define([
    'text!' + ELMP.resource('erdc-type-components/AttrPermissionSetting/index.html'),
    'css!' + ELMP.resource('erdc-type-components/AttrPermissionSetting/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            userAndGroupTree: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/UserAndGroupTree/index.js')),
            FeedbackTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/FeedbackTitle/index.js')),
            createOrEditRightTabs: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/CreateOrEditRightTabs/index.js')
            )
        },
        props: {
            containerOid: {
                type: String,
                default: ''
            },
            typeOid: {
                type: String,
                default: ''
            },
            typeName: {
                type: String,
                default: ''
            },
            showReturnBack: {
                type: Boolean,
                default: false
            },
            isShowAdd: {
                type: Boolean,
                default: true
            },
            maxHeight: {
                type: [String, Number],
                default: ''
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                principalOid: '',
                containerChanged: false
            };
        },
        computed: {
            pageHeight() {
                if (this.maxHeight) {
                    return this.maxHeight;
                } else {
                    return window.innerHeight - 120;
                }
            }
        },
        created() {},
        mounted() {},
        methods: {
            handleContainerChange(bool) {
                this.containerChanged = bool;
            },
            handleMouseDown(event) {
                const childEl = this.$refs.rightPermissionTabs.$el;
                if (!childEl.contains(event.target)) {
                    if (this.containerChanged) {
                        // 点击页面其他地方时，如果三个可拖动容器发生了改变，则弹出提示框
                        this.$refs.rightPermissionTabs.openDialog();
                    }
                    this.containerChanged = false;
                }
            },

            handlerReturnBack() {
                this.$emit('changeShowSetting', false);
            },
            onTreeList(node) {
                this.principalOid = node.oid;
                this.$refs.rightPermissionTabs.initPageData(
                    {
                        containerOid: this.containerOid,
                        principalOid: this.principalOid,
                        typeOid: this.typeOid
                    },
                    node.displayName
                );
            }
        }
    };
});
