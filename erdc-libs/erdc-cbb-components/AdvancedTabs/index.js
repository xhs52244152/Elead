define([
    'text!' + ELMP.resource('erdc-cbb-components/AdvancedTabs/index.html'),
    ELMP.resource('erdc-cbb-components/AdvancedTabs/store.js')
], function (template, store) {
    const Vue = require('vue');
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('AdvancedTabs', store);
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('AdvancedTabs');

    return {
        name: 'AdvancedTabs',
        template,
        props: {
            // 获取唯一标识来匹配tabs数据
            className: [String],
            // 自定义属性集合
            tabsConfig: {
                type: Object,
                default() {
                    return {
                        // 组件事件
                        event: {},
                        // 组件配置
                        props: {}
                    };
                }
            }
        },
        data() {
            return {
                historyActive: [],
                activeName: ''
            };
        },
        computed: {
            ...mapGetters(['getTabs']),
            tabs() {
                return this.getTabs(this.className);
            },
            // tab属性
            attrs() {
                return this.tabs?.attrs;
            },
            // tab事件
            event() {
                return this.tabs?.event;
            },
            tabList() {
                _.each(this.tabs?.tabList, v => Vue.component(v?.component?.componentName, v?.component?.componentUrl));
                return this.tabs?.tabList || [];
            }
        },
        watch: {
            activeName: {
                handler(name) {
                    if (name && !this.historyActive.includes(name)) {
                        this.historyActive.push(name);
                    }
                }
            },
            'tabs.activeName': {
                handler(nv) {
                    if (nv) {
                        this.activeName = nv;
                    }
                },
                immediate: true
            }
        },
        methods: {
            canRenderComp(tab = {}) {
                let { activeName, historyActive } = this;
                return activeName === tab.name || !tab.attrs?.lazy || historyActive.includes(tab.name);
            }
        }
    };
});
