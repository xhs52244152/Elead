define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.label"
                field="props.viewTableConfig.tableConfig.addOperationCol"
            >
                <erd-checkbox 
                    v-model="addOperationCol" 
                    v-bind="props"
                    :disabled="readonly"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    label: this.getI18nByKey('是否显示操作列'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        computed: {
            addOperationCol: {
                get() {
                    return this.schema?.props?.viewTableConfig?.tableConfig?.addOperationCol ?? false;
                },
                set(addOperationCol) {
                    const props = this.schema.props || {};
                    ErdcKit.setFieldValue(
                        props,
                        'viewTableConfig.tableConfig.addOperationCol',
                        addOperationCol,
                        this,
                        '.'
                    );
                    let slotsField = this.schema?.props?.viewTableConfig?.tableConfig?.slotsField || [];
                    if (addOperationCol && !slotsField.find((item) => item.prop === 'operation')) {
                        slotsField.push({
                            prop: 'operation',
                            type: 'default'
                        });
                    }
                    ErdcKit.setFieldValue(props, 'viewTableConfig.tableConfig.slotsField', slotsField, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
