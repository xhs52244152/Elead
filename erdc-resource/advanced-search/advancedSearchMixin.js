define([], function () {
    return {
        watch: {
            $route: {
                immediate: true,
                handler(route) {
                    const isSearchList = route.name === 'AdvancedSearch';
                    this.storeCommit('globalSearchIconVisible', !isSearchList);
                    this.storeCommit('globalSearchVisible', isSearchList);
                }
            },
            mainModelType(val) {
                if (!val) {
                    this.storeCommit('currentHistoryObj', {});
                    this.storeCommit('historyList', []);
                    this.storeCommit('originConditionDtos', []);
                }
            }
        },
        computed: {
            globalSearchIconVisible() {
                return this.$store.getters.getGlobalSearchConsum('globalSearchIconVisible') ?? true;
            },
            globalSearchVisible() {
                return this.$store.getters.getGlobalSearchConsum('globalSearchVisible') ?? false;
            },
            mainModelType() {
                let mainModelType = this.$store.getters.getGlobalSearchConsum('mainModelType');
                if (!mainModelType) {
                    mainModelType = this.$store.getters.className('processRecord');
                }
                if (this.flattenModelTypeList.some((item) => item.value === mainModelType)) {
                    return mainModelType;
                } else {
                    return '';
                }
            },
            tableKey() {
                return this.flattenModelTypeList.find((item) => item.value === this.mainModelType)?.tableKey || '';
            },
            tableViews() {
                return this.$store.getters.getGlobalSearchConsum('tableViews') || '';
            },
            searchKey() {
                return this.$store.getters.getGlobalSearchConsum('searchKey') || '';
            },
            searchType() {
                return this.$store.getters.getGlobalSearchConsum('searchType') || '';
            },
            modelTypeList() {
                return this.$store.getters.getGlobalSearchConsum('modelTypeList') || [];
            },
            flattenModelTypeList() {
                return this.$store.getters.getGlobalSearchConsum('flattenModelTypeList') || [];
            },
            showMoreConditions() {
                return this.$store.getters.getGlobalSearchConsum('showMoreConditions') ?? false;
            },
            historyList() {
                return this.$store.getters.getGlobalSearchConsum('historyList') || [];
            },
            currentHistoryObj() {
                return this.$store.getters.getGlobalSearchConsum('currentHistoryObj') || {};
            },

            // 高级筛选已选条件
            conditionDtos() {
                return this.$store.getters.getGlobalSearchConsum('conditionDtos') || [];
            },
            conditionDtoList() {
                return this.$store.getters.getGlobalSearchConsum('conditionDtoList') || [];
            },
            originConditionsList() {
                return this.$store.getters.getGlobalSearchConsum('originConditionsList') || [];
            }
        },
        methods: {
            storeCommit(key, value) {
                this.$store.commit('setGlobalSearchConsum', { key, value });
            },
            storeDispatch({ action, key }) {
                this.$store.dispatch('setGlobalSearchConsum', { action, key });
            }
        }
    };
});
