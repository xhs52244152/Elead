define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.queryScope"
            field="queryScope"
            :label-width="labelWidth"
        >
            <erd-select 
                v-if="!readonly"
                v-model="queryScope"
                class="w-100p"
                filterable
                clearable
            >
                <erd-option
                    v-for="item in queryScopeArr"
                    :key="item.value"
                    :label="item.displayName"
                    :value="item.value">
                </erd-option>
            </erd-select>
            <span v-else>
                {{queryScopeText}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            queryScope: {
                get() {
                    return this.schema?.props?.queryScope;
                },
                set(queryScope) {
                    const props = this.schema.props || {};
                    this.$set(props, 'queryScope', queryScope);
                    this.setSchemaValue('props', props);
                }
            },
            queryScopeText() {
                return this.queryScopeArr.find((item) => item.value === this.props.queryScope)?.displayName || '';
            },
            queryScopeArr() {
                const queryScopeMap = {
                    USER: ['global', 'fullTenant', 'team', 'teamRole'],
                    ROLE: ['fullTenant', 'team'],
                    ORG: ['fullTenant'],
                    GROUP: ['fullTenant']
                };
                const type = this.schema?.props?.type;
                const queryScopeArr = [
                    {
                        value: 'global',
                        displayName: this.i18n.global
                    },
                    {
                        value: 'fullTenant',
                        displayName: this.i18n.fullTenant
                    },
                    {
                        value: 'team',
                        displayName: this.i18n.team
                    },
                    {
                        value: 'teamRole',
                        displayName: this.i18n.teamRole
                    }
                ];
                return queryScopeArr.filter((item) => {
                    return (queryScopeMap?.[type] || []).includes(item.value);
                });
            }
        },
        watch: {
            queryScopeArr: {
                deep: true,
                immediate: true,
                handler(queryScopeArr) {
                    let queryScope = this.schema?.props?.queryScope;
                    if (!queryScopeArr.find((item) => item.value === queryScope)) {
                        queryScope = queryScopeArr[0]?.value || '';
                    }
                    const props = this.schema.props || {};
                    this.$set(props, 'queryScope', queryScope);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
