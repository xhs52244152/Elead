define(['fam:store', 'fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    store,
    FamKit,
    ConfigurationMixin
) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');

    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.label"
                field="props.viewTableConfig.tableKey"
            >
                <template v-if="!readonly">
                    <custom-select
                        v-model="tableKey"
                        clearable
                        filterable
                        :row="row"
                    >
                    </custom-select>
                </template>
            </fam-dynamic-form-item>
        `,
        inject: ['typeOid', 'attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    label: this.getI18nByKey('viewTableKey')
                },
                tableKeyData: []
            };
        },
        watch: {
            'schema.fieldAttr': {
                deep: true,
                immediate: true,
                handler(fieldAttr) {
                    const fieldOid = fieldAttr?.propertyValueMap?.relation_link_type?.value || '';
                    this.init(fieldOid);
                }
            }
        },
        computed: {
            tableKey: {
                get() {
                    return this.schema?.props?.viewTableConfig?.tableKey || '';
                },
                set(tableKey) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'viewTableConfig.tableKey', tableKey, this, '.');
                    this.setSchema(props);
                }
            },
            row() {
                return {
                    componentName: 'constant-select', // 固定
                    viewProperty: 'displayName', // 显示的label的key
                    valueProperty: 'value', // 显示value的key
                    referenceList: this.tableKeyData
                };
            }
        },
        methods: {
            async setSchema(props) {
                const {
                    addSeq,
                    selectionBox,
                    addOperationCol,
                    showRefresh,
                    showConfigCol,
                    showMoreSearch,
                    showNavBar,
                    selectBoxType
                } = await this.fetchDetailByOid();
                let newProps = {
                    ...props,
                    viewTableConfig: {
                        ...props?.viewTableConfig,
                        viewMenu: {
                            ...props?.viewTableConfig?.viewMenu,
                            showNavBar
                        },
                        tableConfig: {
                            ...props?.viewTableConfig?.tableConfig,
                            addSeq,
                            addOperationCol,
                            addRadio: selectionBox && selectBoxType === 'radio',
                            addCheckbox: selectionBox && selectBoxType === 'multipleChoice',
                            toolbarConfig: {
                                ...props?.viewTableConfig?.tableConfig?.toolbarConfig,
                                showConfigCol,
                                showRefresh,
                                showMoreSearch
                            }
                        }
                    }
                };
                this.setSchemaValue('props', newProps);
            },
            // 根据oid查询详情
            fetchDetailByOid() {
                return new Promise((resolve, reject) => {
                    const oid = this.tableKeyData.find((item) => (item.tableKey === this.tableKey))?.oid;
                    if (oid) {
                        this.$famHttp({
                            url: '/fam/attr',
                            data: {
                                oid
                            },
                            method: 'get'
                        })
                            .then(({ data }) => {
                                const { rawData } = data;
                                resolve(this.extractOrganizationAttr(rawData));
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    } else {
                        reject();
                    }
                });
            },
            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                const tableViewInfo = ErdcKit.deserializeAttr(rawData, {
                    valueMap: {}
                });

                const { viewConfigItems: configItems = '', selectBoxType } = tableViewInfo;
                return {
                    addSeq: configItems.includes('number'),
                    selectionBox: configItems.includes('selectionBox'),
                    addOperationCol: configItems.includes('operate'),
                    showRefresh: configItems.includes('refresh'),
                    showConfigCol: configItems.includes('config'),
                    showMoreSearch: configItems.includes('advancedSearch'),
                    showNavBar: configItems.includes('hasView'),
                    selectBoxType
                };
            },
            init(fieldOid) {
                this.getTypeName(fieldOid, (relationLinkType) => {
                    this.getTableKeyData(relationLinkType);
                });
            },
            getTypeName(fieldOid, callback) {
                if (!fieldOid) {
                    callback && callback();
                    return;
                }
                this.$famHttp({
                    url: '/fam/type/typeDefinition/getTypeDefById',
                    params: {
                        oid: fieldOid
                    }
                }).then((resp) => {
                    const { data } = resp;
                    callback && callback(data.typeName || '');
                });
            },
            getTableKeyData(relationLinkType) {
                let data = {
                    className: this.$store.getters.className('tableDefinition'),
                    pageIndex: 1,
                    pageSize: 10000
                };

                if (relationLinkType) {
                    data.conditionDtoList = [
                        {
                            attrName: 'erd.cloud.foundation.core.tableview.entity.TableDefinition#mainModelType',
                            oper: 'EQ',
                            value1: relationLinkType,
                            logicalOperator: 'AND',
                            isCondition: true
                        }
                    ];
                }
                this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data
                }).then((resp) => {
                    const { data } = resp;
                    const { records = [] } = data;

                    this.tableKeyData = records.map((item) => {
                        let obj = {};
                        item.attrRawList.forEach((ite) => {
                            obj[ite.attrName] = ite.value;
                            if (ite.attrName === 'nameI18nJson') {
                                obj[ite.attrName] = ite.displayName;
                            }
                        });
                        return {
                            ...obj,
                            displayName: obj.nameI18nJson,
                            value: obj.tableKey
                        };
                    });
                });
            }
        }
    };
});
