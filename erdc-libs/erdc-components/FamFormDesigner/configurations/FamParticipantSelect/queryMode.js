define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18n.queryMode"
                field="queryMode"
                :label-width="labelWidth"
            >
                <custom-select
                    v-if="!readonly"
                    v-model="queryMode"
                    :row="row"
                    :collapse-tags="false"
                    multiple
                    clearable
                    filterable
                >
                </custom-select>
                <fam-custom-select-static-text
                    v-else
                    v-model="queryMode"
                    :row="row"
                    multiple
                >
                </fam-custom-select-static-text>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            queryMode: {
                get() {
                    return this.schema?.props?.queryMode || [];
                },
                set(queryMode) {
                    const props = this.schema.props || {};
                    this.$set(props, 'queryMode', queryMode);
                    this.setSchemaValue('props', props);
                }
            },
            referenceList() {
                const type = this.schema?.props?.type || '';
                const queryScope = this.schema?.props?.queryScope || '';
                const optionsMap = {
                    USER: {
                        global: ['FUZZYSEARCH', 'RECENTUSE'],
                        fullTenant: ['ORG', 'GROUP', 'FUZZYSEARCH', 'RECENTUSE'],
                        team: ['ROLE', 'FUZZYSEARCH', 'RECENTUSE'],
                        teamRole: ['FUZZYSEARCH', 'RECENTUSE']
                    },
                    ORG: {
                        fullTenant: ['ORG', 'RECENTUSE']
                    },
                    ROLE: {
                        fullTenant: ['ROLE', 'RECENTUSE'],
                        team: ['ROLE', 'RECENTUSE']
                    },
                    GROUP: {
                        fullTenant: ['GROUP', 'RECENTUSE']
                    }
                };
                let referenceList = [
                    {
                        value: 'ORG',
                        displayName: this.i18n.ORG
                    },
                    {
                        value: 'ROLE',
                        displayName: this.i18n.ROLE
                    },
                    {
                        value: 'GROUP',
                        displayName: this.i18n.GROUP
                    },
                    {
                        value: 'FUZZYSEARCH',
                        displayName: this.i18n.FUZZYSEARCH
                    },
                    {
                        value: 'RECENTUSE',
                        displayName: this.i18n.RECENTUSE
                    }
                ];
                return referenceList.filter((item) => {
                    return (optionsMap?.[type]?.[queryScope] || []).includes(item.value);
                });
            },
            row() {
                return {
                    componentName: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'value',
                    referenceList: this.referenceList
                };
            }
        },
        watch: {
            referenceList: {
                deep: true,
                handler(referenceList) {
                    let queryMode = this.schema?.props?.queryMode || [];
                    const queryModes = queryMode.filter((mode) => {
                        return referenceList.find((item) => item.value === mode);
                    })
                    
                    const props = this.schema.props || {};
                    this.$set(props, 'queryMode', queryModes);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
