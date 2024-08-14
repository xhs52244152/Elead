//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/Cropping/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/Cropping/style.css')
], function (template, store) {
    return {
        template,
        props: {
            title: {
                typeof: String,
                default: '移动到'
            },
            showCroppDialog: {
                typeof: Boolean,
                default: false
            },
            selectList: {
                type: Array,
                default: []
            },
            visible: {
                type: Boolean,
                default: false
            },
            currentSelectTreeData: {
                type: Object,
                default: {}
            },
            className: {
                type: String,
                default: ''
            },
            oid: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-ppm-products/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success')
                },
                value: true,
                reviewPointToElementLink: store.state.classNameMapping.ReviewPointToElementLink
            };
        },
        created() {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        methods: {
            onCheck(...args) {
                this.parentRef = args[0].oid;
            },
            handleConfirm() {
                let rawDataVoList = this.selectList.map((item) => {
                    return {
                        action: 'UPDATE',
                        attrRawList: [
                            {
                                attrName: 'scalable',
                                value: this.value
                            }
                        ],
                        oid: item.oid,
                        className: this.reviewPointToElementLink
                    };
                });

                let params = {
                    action: 'UPDATE',
                    className: this.className,
                    rawDataVoList
                };
                this.$famHttp({
                    url: '/element/saveOrUpdate',
                    method: 'POST',
                    data: params
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['success']
                        });
                        this.$emit('submit-success', '');
                        this.innerVisible = false;
                    }
                });
            },

            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {}
    };
});
