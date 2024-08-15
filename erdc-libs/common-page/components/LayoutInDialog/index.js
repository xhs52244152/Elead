define([
    'text!' + ELMP.resource('common-page/components/LayoutInDialog/index.html'),
    'css!' + ELMP.resource('common-page/components/LayoutInDialog/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        name: 'LayoutInDialog',
        template,
        props: {
            dialogVisible: {
                type: Boolean,
                default: false
            },
            className: {
                type: String,
                default: ''
            },
            routeQueryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            dialogFormInfo: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            classNameKey: {
                type: String,
                default: ''
            }
        },
        components: {
            CommonInfoForm: FamKit.asyncComponent(ELMP.resource(`common-page/components/InfoForm/index.js`))
        },
        data() {
            return {
                dialogTitle: '创建',
                dialogIsVisiable: false
            };
        },
        computed: {},
        watch: {
            dialogVisible(newVal) {
                this.dialogIsVisiable = newVal;
            }
        },
        mounted() {},
        methods: {
            onHandlerConfirm() {
                this.$refs.commonPageLayoutForm?.onHandlerConfirm();
            },
            onHandlerSaveDraft() {
                // 暂无保存草稿相关功能
            },
            onHandlerCancel() {
                this.$emit('submit-success-callback', false, false);
            },
            submitSuccessCallback() {
                this.$emit('submit-success-callback', false, true);
            },
            handlerClickFormEditBtn(rowData) {
                this.$emit('handler-click-form-edit-btn', rowData);
            },
            formCloseCb(isNeedRefresh) {
                if (isNeedRefresh) {
                    this.submitSuccessCallback();
                } else {
                    this.onHandlerCancel();
                }
            }
        }
    };
});
