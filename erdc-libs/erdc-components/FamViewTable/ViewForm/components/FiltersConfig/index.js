define([
    'text!' + ELMP.resource('erdc-components/FamViewTable/ViewForm/components/FiltersConfig/index.html')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            HorizontalTimeline: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamViewTable/ViewForm/components/HorizontalTimeline/index.js')
            ),
            AddTimelineDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamViewTable/ViewForm/components/AddTimelineDialog/index.js')
            )
        },
        props: {
            typeReference: {
                type: [String, Array]
            },
            allFilters: {
                type: Array,
                default: () => []
            },
            selectedFiltersCopy: {
                type: Array,
                default: () => []
            },
            selectedFilterIds: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamViewTable/ViewForm/locale/index.js'),
                i18nMappingObj: {
                    filtersAttr: this.getI18nByKey('基础筛选字段'),
                    addFiltersAttr: this.getI18nByKey('添加筛选字段'),
                    addFiltersBasicAttr: this.getI18nByKey('添加基础筛选字段'),
                    addFiltersAttrTips: this.getI18nByKey('添加筛选字段提示'),
                    noTypeTips: this.getI18nByKey('请先选择类型'),
                    noFiltersTips: this.getI18nByKey('无可配置筛选的字段')
                },
                dialogVisible: false
            };
        },
        computed: {
            activedFiltersIds: {
                get() {
                    // 条件操作下拉列表存在此字段才回显
                    return this.selectedFilterIds.filter((item) =>
                        this.allFilters.some((subItem) => subItem.attrName === item)
                    );
                },
                set(val) {
                    this.$emit('update:selectedFilterIds', val);
                }
            },
            dialogTitle() {
                return this.i18nMappingObj.addFiltersAttr;
            },
            formConfigs() {
                const formConfigs = [
                    {
                        field: 'timeLineFiled',
                        component: 'custom-select',
                        label: this.i18nMappingObj.filtersAttr,
                        labelLangKey: 'filtersAttr',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            'filterable': true,
                            'multiple': true,
                            'collapse-tags': false,
                            'row': {
                                componentName: 'constant-select',
                                viewProperty: 'label',
                                valueProperty: 'attrName',
                                referenceList: this.allFilters
                            }
                        },
                        slots: {
                            component: 'timeLineFiled'
                        },
                        col: 24
                    }
                ];
                return formConfigs;
            },
            activedFiltersData() {
                const activedFiltersData = [];
                this.activedFiltersIds.map((item) => {
                    const filterObj = this.allFilters.find((filterItem) => filterItem.attrName === item);
                    if (filterObj) {
                        activedFiltersData.push(filterObj);
                    }
                });
                return activedFiltersData;
            }
        },
        methods: {
            addFilters() {
                if (!this.typeReference?.length) {
                    this.$message.warning(this.i18nMappingObj.noTypeTips);
                    return;
                }
                if (!this.allFilters?.length) {
                    this.$message.warning(this.i18nMappingObj.noFiltersTips);
                    return;
                }
                this.dialogVisible = true;
            },
            getFiltersParams(isUpdate) {
                const filtersList = [];
                this.selectedFilterIds.forEach((item, index) => {
                    let filtersParams = {
                        attrRawList: [
                            {
                                attrName: 'sortOrder',
                                value: index
                            },
                            {
                                attrName: 'attrName',
                                value: item
                            }
                        ],
                        className: this.$store.getters.className('BaseFilterField')
                    };
                    const filterObj = this.selectedFiltersCopy.find((subItem) => subItem.attrName === item);
                    if (isUpdate && filterObj) {
                        filtersParams.oid = filterObj.oid;
                        filtersParams.action = 'UPDATE';
                    } else {
                        filtersParams.action = 'CREATE';
                    }

                    // 条件操作下拉列表存在此字段才push
                    if (this.allFilters.some((subItem) => subItem.attrName === item)) {
                        filtersList.push(filtersParams);
                    }
                });

                // 编辑表格和视图时, 如果删除了旧值, 则增加"DELETE"对象 入参
                if (isUpdate) {
                    this.selectedFiltersCopy.forEach((item) => {
                        if (!this.selectedFilterIds.includes(item.attrName)) {
                            let filtersParams = {
                                attrRawList: [
                                    {
                                        attrName: 'sortOrder',
                                        value: 0
                                    },
                                    {
                                        attrName: 'attrName',
                                        value: item.attrName
                                    }
                                ],
                                oid: item.oid,
                                action: 'DELETE',
                                className: this.$store.getters.className('BaseFilterField')
                            };
                            filtersList.push(filtersParams);
                        }
                    });
                }
                return filtersList;
            }
        }
    };
});
