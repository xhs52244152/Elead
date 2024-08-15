define([
    'text!' + ELMP.resource('erdc-components/famClassifySearch/index.html'),
    'css!' + ELMP.resource('erdc-components/famClassifySearch/style.css')
], function (template) {
    const TreeUtil = require('TreeUtil');
    return {
        template,
        props: {
            typeSelectWidth: {
                type: String,
                default: '86px'
            },
            attrSelectWidth: {
                type: String,
                default: '160px'
            },
            operSelectWidth: {
                type: String,
                default: '110px'
            },
            componentWidth: {
                type: String,
                default: '240px'
            },
            viewInfo: {
                type: [Object, String],
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/famClassifySearch/locale/index.js'),
                prefixAttrName: 'classifyReference',
                typeOptions: [],
                typeTreeProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'typeName'
                },
                classifyTreeProps: {
                    label: 'displayName',
                    value: 'typeName'
                },
                typeList: [],
                conditionsList: [],
                classifyReferenceList: []
            };
        },
        created() {
            this.getClassifyList();
        },
        mounted() {
            this.addClassifySearchGroup();
            this.initFirstPrefix();
        },
        computed: {
            attrOptions() {
                return [
                    {
                        label: '分类',
                        value: 'classifyReference'
                    }
                ];
            },
            operOptions() {
                return [
                    {
                        label: '等于',
                        value: 'EQ'
                    }
                ];
            },
            showAddClassifyBtn() {
                const classifyManagedTypes = this.viewInfo?.classifyManagedTypes || [];
                return this.conditionsList.length < classifyManagedTypes.length;
            }
        },
        methods: {
            initFirstPrefix() {
                this.$nextTick(() => {
                    const classifyManagedTypes = this.viewInfo?.classifyManagedTypes || [];
                    if (classifyManagedTypes.length) {
                        this.$set(this.conditionsList[0], 'prefixType', classifyManagedTypes[0]?.typeName);
                        this.$set(this.conditionsList[0], 'referenceList', classifyManagedTypes);
                        this.onTypeChange(classifyManagedTypes[0]?.typeName, this.conditionsList[0]);
                    }
                });
            },
            getClassifyList() {
                this.$famHttp({
                    url: '/fam/classify/tree',
                    method: 'get',
                    headers: {
                        'App-Name': 'ALL'
                    }
                }).then((resp) => {
                    this.classifyReferenceList = resp?.data || [];
                });
            },
            addClassifySearchGroup() {
                this.$refs.FamAdvancedGroup.fnAddConditionGroup();
            },
            onVisibleChange(visible, model) {
                let referenceList = this.viewInfo?.classifyManagedTypes || [];
                if (visible) {
                    const typeArr = TreeUtil.flattenTree2Array(referenceList, {
                        childrenField: 'childList'
                    });
                    const selectedPrefixType = this.conditionsList
                        .map((item) => item.prefixType)
                        .filter((item) => item !== model.prefixType);
                    const selectedModelClass = typeArr
                        .filter((item) => selectedPrefixType.includes(item.typeName))
                        .map((item) => item.modelClass);
                    const modelReferenceList = referenceList.filter(
                        (item) => !selectedModelClass.includes(item.modelClass)
                    );
                    this.$set(model, 'referenceList', modelReferenceList);
                } else {
                    this.$set(model, 'referenceList', this.viewInfo?.classifyManagedTypes);
                }
            },
            onClassifyChange(value, model) {
                if (value) {
                    this.$famHttp({
                        url: '/fam/view/classify/getSearchFields',
                        params: {
                            classifyName: value,
                            searchCondition: 'VIEWSEARCH'
                        },
                        method: 'get'
                    }).then((res) => {
                        const resData = res?.data || [];
                        const oldChildrenList = model.childrenList || [];
                        let newChildrenList = oldChildrenList.filter((item) => {
                            return resData.some((subItem) => item.field === subItem.attrName);
                        });
                        this.$set(model, 'classifyConditionList', resData);
                        this.$set(model, 'childrenList', newChildrenList);

                        const classifyArr = TreeUtil.flattenTree2Array(this.classifyReferenceList);
                        this.$set(
                            model,
                            'prefixClassifyOid',
                            classifyArr.find((item) => item.typeName === model.prefixClassify).oid
                        );
                    });
                } else {
                    this.$set(model, 'classifyConditionList', []);
                    this.$set(model, 'childrenList', []);
                    this.$set(model, 'prefixClassifyOid', '');
                }
            },
            onTypeChange(value, model) {
                if (value) {
                    let referenceList = this.viewInfo?.classifyManagedTypes || [];
                    const typeArr = TreeUtil.flattenTree2Array(referenceList, {
                        childrenField: 'childList'
                    });
                    const modelObj = typeArr.find((item) => item.typeName === model.prefixType) || {};
                    this.$set(model, 'prefixAttrName', `${modelObj.modelClass}#classifyReference`);
                    this.$set(model, 'prefixClassify', modelObj.classifyCode);
                    this.onClassifyChange(modelObj.classifyCode, model);
                } else {
                    this.$set(model, 'prefixAttrName', '');
                    this.$set(model, 'prefixClassify', '');
                    this.onClassifyChange('', model);
                }
            }
        }
    };
});
