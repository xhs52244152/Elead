define(['erdcloud.kit', ELMP.resource('ppm-store/index.js'),], function (ErdcKit, ppmStore) {
    return {
        name: 'deliveryForm',
        template: `
            <common-form
                ref="deliveryForm"
                class="w-100p m-0"
                :layout-name="layoutName"
                :class-name="className"
                :readonly="readonly"
                :business-data="businessData"
                form-id="CREATE"
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
                className: ppmStore.state.classNameMapping.document
            };
        },
        computed: {
            layoutName() {
                return this.readonly ? 'PROJECT_DOCUMENT_PROCESS_DETAIL' : 'PROJECT_DOCUMENT_PROCESS_CREATE';
            }
        },
        mounted() {
            let obj = {};
            this.businessData[0]?.deliveryData?.forEach((item) => {
                obj[item.attrName] = item.value;
            });
            this.$refs.deliveryForm.$refs.initForm.$refs.dynamicForm.formData = obj;
        },
        methods: {
            getData() {
                let result = this.$refs.deliveryForm.$refs.initForm.serializeEditableAttr();
                return result;
            }
        }
    };
});
