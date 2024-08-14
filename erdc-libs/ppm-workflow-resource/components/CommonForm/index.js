define([
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('ppm-workflow-resource/components/CommonForm/index.css')
], function (commonHttp) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <fam-advanced-form
                class="ppm-common-form"
                ref="initForm"
                :model.sync="formData"
                :form-id="formId"
                :class-name="className"
                :editableAttr="editableAttr"
                :query-layout-params="queryLayoutParams()"
                :model-mapper="formModelMapper"
                :oid="oid"
                v-bind="$attrs"
                v-on="$listeners"
            >
                <template
                    v-for="(slot, slotName) in formSlots"
                    v-slot:[slotName]="slotProps"
                >
                    <component
                        :ref="slotName"
                        :is="slot"
                        :is-process="true"
                        :business-oid="oid"
                        :business-data="businessData"
                        :class-name="className"
                        v-bind="{...slotProps, ...$attrs, sourceData}"
                        v-on="$listeners"
                        v-model="formData[slotName]"
                    ></component>
                </template>
            </fam-advanced-form>
        `,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        props: {
            formId: {
                type: String,
                default: 'DETAIL'
            },
            layoutName: String,
            className: {
                type: String,
                default: ''
            },
            businessOid: String,
            editableAttr: {
                type: Array,
                default: () => []
            },
            businessData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            formSlots: {
                type: Object,
                default: () => {
                    return {
                        'files': ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        ),
                        'identifier-no': ErdcKit.asyncComponent(
                            ELMP.resource('ppm-workflow-resource/components/commonIdentifierNo/index.js')
                        )
                    };
                }
            },
            modelMapper: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            customQueryParams: Function
        },
        computed: {
            oid() {
                // 如果是创建布局不需要传oid
                return this.formId === 'CREATE' ? '' : this.businessOid || this.businessData[0]?.oid || '';
            },
            formModelMapper() {
                const defaultModelMapper = {
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'templateInfo.templateReference': (data) => {
                        return data['templateInfo.templateReference'].displayName;
                    },
                    'typeReference': (data) => {
                        return data['typeReference']?.displayName;
                    },
                    'projectRef': (data) => {
                        return data['projectRef'].displayName;
                    },
                    'timeInfo.actualEndTime': (data) => {
                        return data['timeInfo.actualEndTime'].displayName;
                    },
                    'timeInfo.actualStartTime': (data) => {
                        return data['timeInfo.actualStartTime'].displayName;
                    },
                    'dueDate': (data) => {
                        return data['dueDate'].displayName;
                    },
                    'submitTime': (data) => {
                        return data['submitTime'].displayName;
                    },
                    'workLoad': (data) => {
                        return data['submitTime'].displayName;
                    },
                    'organizationRef': (data) => {
                        return data['organizationRef'].displayName;
                    }
                };
                let { modelMapper } = this;
                return _.keys(modelMapper).length ? modelMapper : defaultModelMapper;
            },
            sourceData() {
                return this.$refs.initForm?.sourceData || {};
            }
        },
        watch: {
            formData: {
                handler(val) {
                    Object.keys(this.formSlots).forEach((key) => {
                        if (key !== 'files') this.$set(val, key, this.oid);
                    });
                }
            }
        },
        data() {
            return {
                formData: {}
            };
        },
        methods: {
            queryLayoutParams() {
                let params = {
                    name: this.layoutName || 'PROCESSDETAIL',
                    objectOid: this.oid,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.layoutName || 'PROCESSDETAIL'
                        // }
                    ]
                };
                return _.isFunction(this.customQueryParams) ? this.customQueryParams(params) : params;
            }
        }
    };
});
