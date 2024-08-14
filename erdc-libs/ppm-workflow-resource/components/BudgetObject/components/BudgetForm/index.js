define(['erdcloud.kit'], function (ErdcKit) {
    return {
        name: 'BudgetForm',
        template: `
            <common-form
                ref="budgetForm"
                class="w-100p m-0"
                :layout-name="layoutName"
                :class-name="className"
                :form-slots="formSlots"
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
                className: 'erd.cloud.ppm.budget.entity.Budget'
            };
        },
        computed: {
            layoutName() {
                return this.readonly ? 'BUDGET_DETAIL' : 'BUDGET_CREATE';
            },
            formSlots() {
                return {
                    baseline: {
                        template: `
                            <div>
                                <div v-if="!readonly">
                                    <erd-radio v-model="radio" :label="true">{{ i18n.yes }}</erd-radio>
                                    <erd-radio v-model="radio" :label="false">{{ i18n.no }}</erd-radio>
                                </div>
                                <span v-else>{{ radio ? i18n.yes: i18n.no }}</span>
                            </div>
                        `,
                        props: {
                            readonly: Boolean,
                            businessData: {
                                type: Array,
                                default: () => []
                            }
                        },
                        data() {
                            return {
                                i18nPath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                                radio: true
                            };
                        },
                        mounted() {
                            let budgetData = this.businessData[0]?.budgetData;
                            budgetData &&
                                (this.radio = budgetData?.find((item) => item.attrName === 'baseline')?.value);
                        }
                    }
                };
            }
        },
        mounted() {
            let obj = {};
            this.businessData[0]?.budgetData?.forEach((item) => {
                obj[item.attrName] = item.value;
            });
            this.$refs.budgetForm.$refs.initForm.$refs.dynamicForm.formData = obj;
        },
        methods: {
            getData() {
                let result = this.$refs.budgetForm.$refs.initForm.serializeEditableAttr();
                result.push({
                    attrName: 'baseline',
                    value: this.$refs.budgetForm.$refs.baseline[0].radio
                });
                return result;
            }
        }
    };
});
