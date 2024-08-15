define([
    'text!' + ELMP.resource('biz-import-export/views/MyTaskRecords/template.html'),
    ELMP.resource('biz-import-export/locale/index.js')
], function (template, i18nConfig) {
    const erdcloudKit = require('erdcloud.kit');
    const store = require('erdcloud.store');
    const router = require('erdcloud.router');
    const { useI18n } = require('erdcloud.i18n');
    const { computed, ref, onActivated } = require('vue');

    const { t } = useI18n(i18nConfig);

    return {
        setup() {
            const activeTabName = ref(
                router.currentRoute.params.activeTabName ||
                    router.currentRoute.query.activeTabName ||
                    'taskTabPanelImport'
            );

            const tabList = computed(() =>
                store.state.operationRecords.operRecordsTabs?.map((item) => ({
                    label: t(item.label) || item.label,
                    name: item.name,
                    component: erdcloudKit.asyncComponent(ELMP.resource(item.componentPath))
                }))
            );

            const i18n = computed(() => {
                return useI18n(i18nConfig);
            });

            const activeTabObj = computed(() => {
                const activeObj = tabList.value.find((item) => {
                    return item.name === activeTabName.value;
                });
                return activeObj || {};
            });

            onActivated(() => {
                if (router.currentRoute.params.activeTabName || router.currentRoute.query.activeTabName) {
                    activeTabName.value =
                        router.currentRoute.params.activeTabName || router.currentRoute.query.activeTabName;
                }
            });

            return {
                tabList,
                i18n,
                activeTabObj,
                activeTabName
            };
        },
        components: {
            FamPageTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        template,
        watch: {
            '$route.query': {
                deep: true,
                handler(query) {
                    this.activeTabName = query?.activeTabName || this.activeTabName;
                }
            }
        }
    };
});
