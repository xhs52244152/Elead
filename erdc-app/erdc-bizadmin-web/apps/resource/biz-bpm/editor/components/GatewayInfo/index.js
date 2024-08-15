define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'erdcloud.kit'
], function(PropertiesPanelMixin) {

    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'GatewayInfo',
        mixins: [PropertiesPanelMixin],
        template: `
            <div id="process-gateway-info" class="process-gateway-info">
                <erd-contraction-panel
                    :title="i18nMappingObj.gateway"
                    :unfold.sync="expanded"
                >
                  <template #content>
                      <FamDynamicForm
                          ref="dynamicForm"
                          :form.sync="formData"
                          :data="formConfigs"
                          label-width="120px"
                          :readonly="readonly"
                          @field:change="onFieldChange"
                      >
                      </FamDynamicForm>
                  </template>
                </erd-contraction-panel>
            </div>
        `,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'gateway', 'flowOrder', 'pleaseFillIn'
                ]),
                expanded: true
            };
        },
        computed: {
            formData: {
                get() {
                    return this.extractBaseInfo();
                },
                set(formData) {
                    this.updateNodeInfo(formData);
                }
            },
            formConfigs() {
                return [
                    {
                        field: 'flow_order',
                        label: this.i18nMappingObj.flowOrder,
                        component: 'erd-input',
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseFillIn
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            extractBaseInfo() {
                return {
                    flow_order: this.getExtensionValue(this.activeElement, 'flow_order')
                };
            },
            onFieldChange({ field }, value) {
                this.saveExtensionValues(this.activeElement, field, value);
            }
        }
    };
});
