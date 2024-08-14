define(['text!' + ELMP.resource('ppm-component/ppm-components/CopyOrMove/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            CopyOrMoveContent: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/CopyOrMove/components/CopyOrMoveContent/index.js')
            )
        },
        props: {
            type: String,
            visible: Boolean,
            // 是否使用计划集
            usePlanSet: Boolean
            // 当前编辑数据的oid
            // currentOid: {
            //     type: String,
            //     default: ''
            // }
            // className: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/CopyOrMove/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    copy: this.getI18nByKey('copy'),
                    move: this.getI18nByKey('move'),
                    pleaseSelectProject: this.getI18nByKey('pleaseSelectProject')
                }
            };
        },
        computed: {
            showDialog: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        methods: {
            editCopyOrMoveConfirm() {
                let data = this.$refs.copyOrMove.form;
                this.$refs.copyOrMove.$refs.baseInfoForm.validate((valid) => {
                    valid && this.$emit('editCopyOrMoveConfirm', data);
                });
            },
            editCopyOrMoveCancel() {
                this.showDialog = false;
                this.$emit('editCopyOrMoveCancel');
            }
        }
    };
});
