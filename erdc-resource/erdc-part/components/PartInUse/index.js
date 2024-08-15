define([
    'text!' + ELMP.func('erdc-part/components/PartInUse/index.html'),
    ELMP.func('erdc-part/config/viewConfig.js')
], function (template, viewCfg) {
    const ErdcKit = require('erdc-kit');
    const Part_In_Use_Url = `part/bom/getUsedByLevel/${1}`;

    return {
        name: 'PartInUse',
        template,
        components: {
            InUse: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/InUse/index.js'))
        },
        props: {
            oid: String,
            className: String,
            vm: Object
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-part/locale/index.js')
            };
        },
        computed: {
            innerClassName() {
                return this.className || viewCfg.partViewTableMap.className;
            }
        },
        methods: {
            refresh() {
                this.$refs.table?.refresh();
            },
            viewTableConfig(data) {
                const {
                    columns,
                    tableRequestConfig,
                    tableBaseConfig: { treeConfig },
                    slotsField
                } = data;

                let hasViewCol = columns.find((item) => {
                    item.attrName === 'viewName';
                });
                if (!hasViewCol) {
                    columns.splice(3, 0, {
                        attrName: 'viewName',
                        label: this.i18n?.['视图']
                    });
                }

                tableRequestConfig.url = Part_In_Use_Url;
                treeConfig.loadMethod = ({ row }) => {
                    return this.getBeUseByParent(row);
                };
                slotsField.push({
                    prop: 'viewName', // 当前字段使用插槽
                    type: 'default'
                });
                return {
                    ...data
                };
            },
            getBeUseByParent(row) {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: Part_In_Use_Url,
                        className: this.innerClassName,
                        data: {
                            childOid: row?.childOid || ''
                        },
                        method: 'GET'
                    }).then((resp) => {
                        var data = resp.data || {};
                        if (_.isArray(data.childrenList) && data.childrenList.length > 0) {
                            data.childrenList.forEach((item) => {
                                item.isChildren = !item.leaf;
                            });
                            resolve(data.childrenList);
                        } else {
                            row.isChildren = false;
                            resolve([]);
                        }
                    });
                });
            }
        }
    };
});
