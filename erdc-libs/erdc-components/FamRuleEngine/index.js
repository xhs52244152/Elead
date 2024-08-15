define([
    'text!' + ELMP.resource('erdc-components/FamRuleEngine/index.html'),
    'css!' + ELMP.resource('erdc-components/FamRuleEngine/style.css'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            oid: {
                type: String,
                default: ''
            },
            className: {
                type: String,
                default: ''
            },
            isUpdate: {
                type: Boolean,
                default: false
            },
            ruleConditionDtoList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            originConditionDtos: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                conditionDtos: [],
                conditionDtosCopy: [],
                conditionsColumnsList: [],
                loading: false
            };
        },
        watch: {
            originConditionDtos: {
                immediate: true,
                deep: true,
                handler(val) {
                    this.conditionDtos = val || [];
                }
            }
        },
        created() {
            if (this.isUpdate) {
                this.conditionsEcho();
            }
        },
        methods: {
            getRuleEngineParams() {
                const conditionsList = this.$refs.advancedGroup.getConditions();
                if (conditionsList) {
                    return this.getRelationList(conditionsList);
                }
            },
            getConditionsList() {
                return this.$refs.advancedGroup.getConditions();
            },
            getOriginConditionsList() {
                const { getConditions, conditionsList = [] } = this.$refs.advancedGroup;
                if (getConditions()) {
                    return conditionsList;
                }
            },
            getRelationList(conditionsList) {
                const recursionGetRelations = (arr) => {
                    let tempRelationList = [];
                    arr.forEach((item) => {
                        let attrRawList = [];
                        Object.keys(item).forEach((subItem) => {
                            if (['oid', 'id', 'children'].includes(subItem)) {
                                return;
                            }

                            // 是条件组 且 属性名为value1 不push
                            if (!item.isCondition && subItem === 'value1') {
                                return;
                            }
                            attrRawList.push({
                                attrName: subItem,
                                value: subItem === 'isCondition' ? Number(item[subItem]) : item[subItem]
                            });
                        });
                        let obj = {
                            attrRawList,
                            className: this.$store.getters.className('RuleCondition')
                        };

                        if (item.children?.length) {
                            obj.associationField = 'parentRef';
                            obj.relationList = recursionGetRelations(item.children);
                        }
                        tempRelationList.push(obj);
                    });
                    return tempRelationList;
                };
                let relationList = recursionGetRelations(conditionsList);

                return relationList;
            },
            clearAllConditions() {
                this.$refs.advancedGroup.resetHanldClick();
            },
            // 处理条件回显
            async conditionsEcho() {
                this.loading = true;
                Promise.all([await this.fnGetFieldList(), await this.fnGetConditionsField()])
                    .then((resp) => {
                        const fieldList = resp?.[0] || [];
                        this.conditionsColumnsList = resp?.[1] || [];

                        // 处理条件组回显
                        let handleRenderData = (arr) => {
                            let conditionDtos = [];
                            arr.forEach((item) => {
                                let index = item.sortOrder;
                                const attr = this.conditionsColumnsList?.find((i) => i.attrName === item.attrName);
                                if (attr?.inputType === 'Boolean') {
                                    try {
                                        item.value1 = JSON.parse(item.value1);
                                    } catch (e) {
                                        // do nothing
                                    }
                                }

                                if (item.children) {
                                    let childrenList = handleRenderData(item.children);
                                    conditionDtos[index] = {
                                        ...item,
                                        type: 'group',
                                        relation: item.logicalOperator,
                                        childrenList
                                    };
                                } else {
                                    let value = typeof item.value1 !== 'undefined' ? item.value1 : '';
                                    // 转JSON格式，保存时候就是传JSON字符串，保存什么，后端返回什么（暂时去掉）
                                    // try {
                                    //     value = item.value1 ? JSON.parse(item.value1) : '';
                                    // } catch (e) {
                                    //     value = item.value1 || '';
                                    // }

                                    // 如果存在value2，则value1和value2合并成数组
                                    if (typeof item.value2 !== 'undefined') {
                                        value = [item.value1, item.value2];
                                    }
                                    const component = fieldList.find((ite) => ite.attrName === item.attrName);

                                    if (component) {
                                        if (!ErdcKit.isSameComponentName(component.componentName, item.componentName)) {
                                            item.componentName = component.componentName;
                                            item.componentJson = component.componentJson;
                                        }

                                        if (
                                            ErdcKit.isSameComponentName(
                                                component.componentName,
                                                'FamOrganizationSelect'
                                            )
                                        ) {
                                            value = item.orgList || [];
                                        }
                                        if (
                                            ErdcKit.isSameComponentName(
                                                component.componentName,
                                                'CustomVirtualSelect'
                                            ) &&
                                            ['IN', 'NOT_IN'].includes(item.oper)
                                        ) {
                                            value = item.value1.split(',') || [];
                                        }
                                    }

                                    // 组件配置
                                    let componentJson = item.componentJson;
                                    try {
                                        componentJson = JSON.parse(componentJson);
                                    } catch (e) {
                                        componentJson = {};
                                    }

                                    // 操作选项补充
                                    let operationList;
                                    if (item.operationList) {
                                        operationList = item.operationList;
                                    } else {
                                        const tempObj = this.conditionsColumnsList.find(
                                            (subItem) => subItem.attrName === item.attrName
                                        );
                                        operationList = tempObj?.operationList;
                                    }

                                    conditionDtos[index] = {
                                        ...item,
                                        field: item.attrName,
                                        operator: item.oper || '',
                                        operationList,
                                        value,
                                        relation: item.logicalOperator,
                                        showComponent: this.fnComponentHandle(item.componentName).showComponent,
                                        dataKey: fieldList.find((ite) => ite.attrName === item.attrName)?.dataKey || '',
                                        props: {
                                            ...componentJson?.props,
                                            ...(item?.props || {}),

                                            defaultValue: item?.userDtoList || {},
                                            multiple: 'false'
                                        },
                                        dataType: 'string'
                                    };
                                }
                            });
                            return conditionDtos;
                        };
                        this.loading = false;
                        this.conditionDtos = handleRenderData(this.ruleConditionDtoList);
                        this.conditionDtosCopy = handleRenderData(this.ruleConditionDtoList);
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },

            // 获取字段数据
            fnGetFieldList() {
                return this.$famHttp({
                    url: '/fam/view/getFieldsByType',
                    method: 'post',
                    params: {
                        isAttrAddModelName: true,
                        searchCondition: 'RULECONDITION'
                    },
                    data: [this.oid]
                }).then((resp) => {
                    return resp?.data || [];
                });
            },
            fnGetConditionsField() {
                return this.$famHttp({
                    url: '/fam/view/getSearchFields',
                    method: 'post',
                    params: {
                        isAttrAddModelName:true,
                        searchCondition: 'RULECONDITION'
                    },
                    data: [this.oid]
                }).then((resp) => {
                    return resp?.data || [];
                });
            },
            changeConditionsList(value) {
                this.$store.commit('setGlobalSearchConsum', { key: 'conditionDtos', value });
            }
        }
    };
});
