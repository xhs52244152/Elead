define([
    'text!' + ELMP.resource('system-global-search/components/ConfigLeft/template.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            configTree: ErdcKit.asyncComponent(ELMP.resource('system-global-search/components/ConfigTree/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-global-search/locale/index.js'),
                i18nMappingObj: {},
                applicationList: [],
                applicationOid: '',
                treeList: []
            };
        },
        watch: {
            applicationOid(val) {
                this.$refs.configTree?.clearSearchLeftKey();
                this.getTypeTree(val);
            }
        },
        created() {
            this.getApplication();
        },
        methods: {
            // 获取应用列表
            getApplication() {
                this.$famHttp({
                    url: '/platform/application/getCurrentTenantIdApplication'
                }).then((resp) => {
                    const { data } = resp || [];
                    const platAppInfo = data.find((item) => item.identifierNo === 'plat');
                    if (platAppInfo) {
                        this.applicationOid = platAppInfo.oid;
                    }
                    this.applicationList = data || [];
                });
            },

            // 通过应用获取树结构
            getTypeTree(applicationOid) {
                if (applicationOid) {
                    this.$famHttp({
                        url: '/fam/type/typeDefinition/getTypeTree',
                        params: {
                            className: 'erd.cloud.foundation.type.entity.TypeDefinition',
                            applicationOid
                        }
                    }).then((resp) => {
                        const { data } = resp || [];
                        const recursionFn = (data = [], parentOid, level = 1) => {
                            data = data.map((item) => {
                                const hasCheckBox = item.serviceInfoRef && item.instantiable;
                                let newItem = {
                                    oid: item.typeOid,
                                    label: item.displayName,
                                    instantiable: hasCheckBox,
                                    typeName: item.typeName,
                                    disabled: !hasCheckBox,
                                    children: item.childList,
                                    parentOid: parentOid || null,
                                    level
                                };
                                if (newItem.children?.length) {
                                    newItem.children = recursionFn(newItem.children, newItem.oid, level + 1);
                                }
                                return newItem;
                            });
                            return data;
                        };
                        this.treeList = recursionFn(data);
                    });
                } else {
                    this.treeList = [];
                }
            }
        }
    };
});
