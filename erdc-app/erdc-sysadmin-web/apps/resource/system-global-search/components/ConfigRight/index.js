define([
    'text!' + ELMP.resource('system-global-search/components/ConfigRight/template.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-global-search/locale/index.js'),
                i18nMappingObj: {},
                tableKey: '',
                searchKey: ''
            };
        },
        computed: {
            checkedNodes() {
                return this.$store.getters.getGlobalSearchConfig('checkedNodes') || [];
            },
            currentModel() {
                return this.$store.getters.getGlobalSearchConfig('currentModel') || {};
            },
            viewList() {
                return this.$store.getters.getGlobalSearchConfig('viewList') || [];
            },
            filteredViewList() {
                return this.viewList.filter((item) => {
                    return item.displayName.includes(this.searchKey.trim());
                });
            }
        },
        watch: {
            currentModel(val) {
                this.searchKey = '';
                this.tableKey = val?.tableKey;
            }
        },
        mounted() {
            document.addEventListener('visibilitychange', this.visibilitychange);
        },
        destroyed() {
            document.removeEventListener('visibilitychange', this.visibilitychange);
        },
        methods: {
            visibilitychange() {
                if (document.visibilityState === 'visible') {
                    this.$store.dispatch('setGlobalSearchConfig', this.currentModel);
                }
            },
            setTableKey(val) {
                const checkedNodes = this.checkedNodes.map((item) => {
                    if (item.oid === this.currentModel.oid) {
                        item.tableKey = val;
                    }
                    return item;
                });
                this.$store.commit('setGlobalSearchConfig', { key: 'checkedNodes', value: checkedNodes });
            },
            openCreateTableTab() {
                window.open('#/system-viewtable/viewtable?openCreateViewTable=true', '_blank');
            }
        }
    };
});
