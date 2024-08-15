define([
    'erdcloud.kit',
    ELMP.resource('platform-dev-ops/api.js'),
    'text!' + ELMP.resource('platform-dev-ops/components/CacheKeyDetail/template.html')
], function (ErdcKit, api, template) {
    return {
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamMonacoEditor: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamMonacoEditor/index.js'))
        },
        props: {
            currentCacheKey: String,
            currentRegion: String,
            currentServiceShortName: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('platform-dev-ops/locale/index.js'),
                form: {},
                loading: false
            };
        },
        computed: {
            data() {
                return [
                    {
                        field: 'region',
                        component: 'erd-input',
                        label: this.i18n.region,
                        col: 12
                    },
                    {
                        field: 'level',
                        component: 'erd-input',
                        label: this.i18n.level,
                        slots: {
                            readonly: 'cache-level-readonly'
                        },
                        col: 12
                    },
                    {
                        field: 'value',
                        label: this.i18n.cacheValue,
                        slots: {
                            readonly: 'cache-value-content'
                        },
                        col: 24
                    }
                ];
            },
            monacoEditorConfig() {
                return {
                    language: 'json',
                    automaticLayout: true,
                    autoSurround: true,
                    fontSize: 14,
                    contextmenu: false
                };
            }
        },
        watch: {
            currentRegion() {
                this.fetchCacheInfo();
            },
            currentCacheKey() {
                this.fetchCacheInfo();
            },
            currentServiceShortName() {
                this.fetchCacheInfo();
            }
        },
        mounted() {
            this.fetchCacheInfo();
        },
        methods: {
            translateCacheLevel(level) {
                return [this.i18n.l1Cache, this.i18n.l2Cache][level - 1] || level;
            },
            fetchCacheInfo() {
                this.loading = true;
                return api
                    .fetchCacheInfo({
                        region: this.currentRegion,
                        service: this.currentServiceShortName,
                        key: this.currentCacheKey
                    })
                    .then(({ data }) => {
                        data.valueJson = JSON.stringify(data.value, null, 4);
                        this.form = data;
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            }
        }
    };
});
