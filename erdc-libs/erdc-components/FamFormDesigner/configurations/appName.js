define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    const store = require('fam:store');
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18n.appName"
                field="appName"
            >
                <custom-select
                    v-model="schema.props.appName"
                    :row="row"
                    clearable>
                
                </custom-select>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            row() {
                return {
                    componentName: 'constant-select',
                    viewProperty: 'displayName', // 显示的label的key
                    valueProperty: 'identifierNo', // 显示value的key
                    referenceList: [
                        {
                            displayName: '全部',
                            identifierNo: 'ALL'
                        },
                        ...store.state.app.appNames
                    ]
                };
            }
        }
    };
});
