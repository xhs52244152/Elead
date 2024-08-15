define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            label="角色类型"
            field="queryParams.data.roleType"
            :label-width="labelWidth"
        >
            <custom-select
                v-model="roleType"
                :row="row"
                :readonly="readonly"
                :treeProps="treeProps"
                treeSelect
                default-expand-all
            >
            </custom-select>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),

                row: {
                    componentName: 'virtual-select',
                    requestConfig: {
                        url: 'fam/dictionary/tree/role_type',
                        viewProperty: 'displayName',
                        valueProperty: 'identifierNo',
                        data: {
                            isGetAll: true
                        }
                    }
                },
                treeProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'identifierNo'
                }
            };
        },
        computed: {
            roleType: {
                get() {
                    // 默认取团队角色 Erd-202200000003
                    return this.schema.props?.queryParams?.data?.roleType || 'Erd-202200000003';
                },
                set(roleType) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'queryParams.data.roleType', roleType, this, '.');
                    this.setSchemaValue('props', props);
                }
            },
        }
    };
});
