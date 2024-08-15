define(['fam:store', 'fam:kit', ELMP.resource('erdc-components/FamParticipantSelect/componentConfig.js')], function (
    store,
    FamKit,
    componentConfig
) {
    return {
        props: {
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        create() {
            this.initQueryModes = componentConfig.QUERYMODES;
        },
        methods: {
            // 处理通过配置传进来的接口配置
            createQueryMode(schema) {
                const customSchema = this.customSchema && this.customSchema(schema);
                if (!_.isEmpty(this.queryParams)) {
                    if (!schema?.queryParams?.data) {
                        FamKit.setFieldValue(schema, 'queryParams.data', {}, this, '.');
                    }
                    if ((schema.type === 'USER' || schema.type === 'ROLE') && schema.queryScope === 'team') {
                        schema.queryParams.data.teamOrignType = this.queryParams?.data?.teamOrignType || '';
                    }
                }
                if (schema.type === 'ROLE' && schema.queryScope === 'fullTenant' && this.queryParams?.data?.roleType) {
                    if (this.queryParams?.data?.roleType !== 'All') {
                        schema = {
                            ...schema,
                            component: 'SimpleSelect',
                            className: store.getters.className('Role'),
                            requestConfig: {
                                url: 'fam/role/listAllTree',
                                data: {
                                    appName: this.queryParams.data.appName,
                                    isGetVirtual: true,
                                    roleType: this.queryParams.data.roleType
                                },
                                method: 'GET'
                            },
                            leftRequestConfig: null
                        };
                    } else {
                        this.queryParams.data.roleType = undefined;
                    }
                }
                return {
                    ...schema,
                    ...customSchema
                };
            }
        }
    };
});
