define([
    'text!' + ELMP.resource('advanced-search/components/SearchInputBox/index.html'),
    ELMP.resource('advanced-search/advancedSearchMixin.js'),
    'css!' + ELMP.func('advanced-search/styles/style.css')
], function (template, advancedSearchMixin) {
    return {
        mixins: [advancedSearchMixin],
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('advanced-search/locale/index.js'),
                i18nMappingObj: {}
            };
        },
        created() {
            this.storeDispatch({ action: 'getModelTypeList', key: 'modelTypeList' });
        },
        methods: {
            onInputChange(val) {
                this.storeCommit('searchKey', val);
                this.storeCommit('showMoreConditions', !val);
            },
            onInputFocus() {
                this.storeCommit('showMoreConditions', !this.searchKey);
            },
            onInputClear() {
                this.storeCommit('showMoreConditions', !this.searchKey);
                if (!this.globalSearchIconVisible) {
                    this.$emit('onGlobalSearch');
                }
            },
            onInputSearch() {
                if (!this.mainModelType) {
                    this.$message.warning(`${this.i18n.pleaseSelect}${this.i18n.mainModelType}`);
                    return;
                }
                this.storeCommit('showMoreConditions', false);
                this.storeCommit('globalSearchVisible', false);
                this.storeCommit('searchType', 'inputSearch');
                if (this.globalSearchIconVisible) {
                    this.$router.push({
                        path: '/container/advanced-search',
                        query: {
                            mainModelType: this.mainModelType,
                            searchKey: this.searchKey,
                            searchType: this.searchType,
                            currentHistoryObj: this.currentHistoryObj
                        }
                    });
                } else {
                    this.$emit('onGlobalSearch');
                }
            },
            changeMainModelType(val) {
                this.storeCommit('mainModelType', val);
                if (this.$route.name === 'AdvancedSearch') {
                    this.storeDispatch({ action: 'getTableViews', key: 'tableViews' });
                }
            }
        }
    };
});
