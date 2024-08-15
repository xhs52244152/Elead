define([
    'text!' + ELMP.resource('advanced-search/views/GlobalSearchConditions/index.html'),
    ELMP.resource('advanced-search/advancedSearchMixin.js'),
    'css!' + ELMP.func('advanced-search/styles/style.css')
], function (template, advancedSearchMixin) {
    const erdcloudKit = require('erdcloud.kit');

    return {
        mixins: [advancedSearchMixin],
        template,
        components: {
            SearchInputBox: erdcloudKit.asyncComponent(
                ELMP.resource('advanced-search/components/SearchInputBox/index.js')
            ),
            HistoryFilters: erdcloudKit.asyncComponent(
                ELMP.resource('advanced-search/components/HistoryFilters/index.js')
            ),
            AdvancedFilters: erdcloudKit.asyncComponent(
                ELMP.resource('advanced-search/components/AdvancedFilters/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('advanced-search/locale/index.js'),
                i18nMappingObj: {},
                btnLoading: false
            };
        },
        computed: {
            btnDisabled() {
                return !this.conditionDtos?.length;
            }
        },
        methods: {
            onGlobalSearch() {
                const { conditionsList, originConditionsList } = this.getRuleEngineData();
                if (!conditionsList) {
                    return;
                }
                this.storeCommit('conditionDtoList', conditionsList);
                this.storeCommit('globalSearchVisible', false);
                this.storeCommit('searchType', 'conditionDtoSearch');
                if (this.globalSearchIconVisible) {
                    this.storeCommit('originConditionsList', originConditionsList);
                    this.$router.push({
                        path: '/container/advanced-search',
                        query: {
                            mainModelType: this.mainModelType,
                            searchKey: '',
                            searchType: this.searchType,
                            currentHistoryObj: this.currentHistoryObj,
                            conditionsList: JSON.stringify(this.conditionDtoList),
                            originConditionsList: JSON.stringify(this.originConditionsList)
                        }
                    });
                } else {
                    this.$emit('onGlobalSearch');
                }
            },
            async saveFilters() {
                const { originConditionsList } = this.getRuleEngineData();
                if (!originConditionsList) {
                    return;
                }
                let filterName = await this.setFilterName();
                if (filterName === false) {
                    return;
                }
                let params = {
                    attrRawList: [
                        {
                            attrName: 'description',
                            value: filterName
                        },
                        {
                            attrName: 'configType',
                            value: 'USER_PREFERENCE'
                        },
                        {
                            attrName: 'configModule',
                            value: 'GLOBAL_SEARCH_HIS'
                        },
                        {
                            attrName: 'keyValue',
                            value: this.mainModelType
                        },
                        {
                            attrName: 'configValue',
                            value: JSON.stringify(originConditionsList)
                        }
                    ],
                    className: 'erd.cloud.foundation.principal.entity.SystemSetting'
                };
                this.btnLoading = true;
                this.$famHttp({
                    url: '/fam/create',
                    data: params,
                    method: 'post'
                })
                    .then(() => {
                        this.$message.success(this.i18n.saveSuccess);
                        this.$refs.historyFilters.getHistoryList();
                    })
                    .finally(() => {
                        this.btnLoading = false;
                    });
            },
            getRuleEngineData() {
                if (!this.mainModelType) {
                    this.$message.warning(this.i18n.pleaseSelect + this.i18n.mainModelType);
                    return {};
                }
                const { getConditionsList, getOriginConditionsList } = this.$refs.advacedFilters.$refs.famRuleEngine;
                const conditionsList = getConditionsList();
                if (!conditionsList) {
                    return {};
                }
                const originConditionsList = getOriginConditionsList();
                return { conditionsList, originConditionsList };
            },
            setFilterName() {
                return new Promise((resolve) => {
                    const { conditionName, saveConditions, confirm, cancel } = this.i18n;

                    this.$prompt(conditionName, saveConditions, {
                        confirmButtonText: confirm,
                        cancelButtonText: cancel,
                        customClass: 'global-search-message-box',
                        closeOnClickModal: false,
                        closeOnHashChange: false,
                        beforeClose: (action, instance, done) => {
                            if (action === 'confirm') {
                                const inputValue = instance._data.inputValue;
                                if (!inputValue) {
                                    return this.$message.warning(this.i18n.filterTip);
                                }
                                if (inputValue.trim().length > 100) {
                                    return this.$message.warning(this.i18n.filterExceedTip);
                                }
                                resolve(inputValue);
                                done();
                            } else {
                                resolve(false);
                                done();
                            }
                        }
                    });
                });
            },
            clearAllConditions() {
                this.$refs.advacedFilters.$refs.famRuleEngine.clearAllConditions();
            }
        }
    };
});
