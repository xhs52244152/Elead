define([
    'text!' + ELMP.resource('system-global-search/components/GlobalSearchConfig/template.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            configLeft: ErdcKit.asyncComponent(ELMP.resource('system-global-search/components/ConfigLeft/index.js')),
            configCenter: ErdcKit.asyncComponent(
                ELMP.resource('system-global-search/components/ConfigCenter/index.js')
            ),
            configRight: ErdcKit.asyncComponent(ELMP.resource('system-global-search/components/ConfigRight/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-viewtable/locale/index.js'),
                i18nMappingObj: {},
                form: {
                    tableKey: ''
                },
                checkedIdsMap: {}
            };
        },
        computed: {
            formLayout() {
                return [
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: ' ',
                        props: {
                            unfold: true,
                            hideTitle: true
                        },
                        children: [
                            {
                                field: 'config',
                                label: '',
                                component: 'slot',
                                props: {
                                    name: 'config'
                                },
                                col: 24
                            }
                        ]
                    }
                ];
            }
        },
        created() {
            this.getListAllTree();
        },
        methods: {
            // 获取配置信息
            getListAllTree() {
                this.$famHttp({
                    url: '/fam/listAllTree',
                    params: {
                        className: 'erd.cloud.foundation.search.entity.GlobalSearch'
                    }
                }).then((resp) => {
                    const { data } = resp || [];

                    let checkedNodes = [];
                    const recursionFn = (data, parentOid = null) => {
                        data.forEach((item) => {
                            const newItem = {
                                id: item.oid,
                                oid: item.key,
                                parentOid,
                                tableKey: item.target,
                                label: item.displayName,
                                typeName: item.identifierNo,
                                instantiable: true,
                                disabled: false,
                                level: item.level,
                                children: []
                            };
                            checkedNodes.push(newItem);
                            if (item.childList) {
                                recursionFn(item.childList, item.key);
                            }
                        });
                    };
                    recursionFn(data);
                    checkedNodes.forEach((item) => {
                        this.checkedIdsMap[item.oid] = item.id;
                    });
                    this.$store.commit('setGlobalSearchConfig', { key: 'checkedNodes', value: checkedNodes });
                });
            }
        }
    };
});
