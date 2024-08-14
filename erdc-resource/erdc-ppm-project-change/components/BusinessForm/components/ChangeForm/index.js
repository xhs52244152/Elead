define(['erdcloud.kit'], function (ErdcKit) {
    return {
        name: 'changeForm',
        template: `
            <common-form
                ref="changeForm"
                class="w-100p m-0 pt-0"
                :layout-name="layoutName"
                :class-name="className"
                form-id="CREATE"
                :editableAttr="editableAttr"
                v-bind="$attrs"
                v-on="$listeners"
            ></common-form>
        `,
        props: {
            readonly: Boolean,
            businessData: {
                type: Array,
                default: () => []
            }
        },
        components: {
            CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js'))
        },
        data() {
            return {
                editableAttr: ['changeType'],
                className: 'erd.cloud.ppm.change.entity.Change'
            };
        },
        computed: {
            layoutName() {
                return this.readonly ? 'CHECK_CREATE' : 'PREPARATION_CREATE';
            },
            initFormRef() {
                return this.$refs?.changeForm?.$refs?.initForm;
            }
        },
        watch: {
            businessData(val) {
                let obj = {};
                // 防止创建计划变更后清空变更原因和对策措施
                Object.keys(this.$attrs.changeFormData).forEach((key) => {
                    if (this.$attrs.changeFormData[key]) {
                        obj[key] = this.$attrs.changeFormData[key];
                    }
                });
                obj.changeType = val[0]?.changeType || '';
                val[0]?.projectBasicInfo?.changeFormData?.forEach((item) => {
                    obj[item.attrName] = item.value;
                });
                obj.changeContent = val[0].changeContentName;
                this.initFormRef.$refs.dynamicForm.formData = obj;
            }
        },
        mounted() {
            let obj = {};
            obj.changeType = this.businessData[0]?.changeType || '';
            obj.changeContent = this.businessData[0].changeContentName;
            this.businessData[0]?.projectBasicInfo?.changeFormData?.forEach((item) => {
                obj[item.attrName] = item.value;
            });
            this.initFormRef.$refs.dynamicForm.formData = obj;
        }
    };
});
