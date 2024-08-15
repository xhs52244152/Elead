define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/template.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'BpmProcessNavigation',
        template,
        components: {
            BpmProcessHelp: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHelp/index.js')),
            BpmProcessIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessIcon/index.js')),
            BpmProcessTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessTitle/index.js')),
            BpmProcessHorse: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHorse/index.js'))
        },
        props: {
            collapsed: {
                type: Boolean,
                default: false
            },
            activities: {
                type: Array,
                required: true
            },
            users: {
                type: Array,
                default() {
                    return [];
                }
            },
            currentActivityId: {
                type: [String, Array]
            },
            viewActivityId: String,
            vertical: {
                type: Boolean,
                default: true
            },
            height: {
                type: [String, Number],
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-process-components/BpmProcessNavigation/locale/index.js')
            };
        },
        computed: {
            sideMenuStyle() {
                return {
                    width: this.collapsed ? '40px' : '200px'
                };
            },
            textStyle() {
                return {
                    opacity: this.collapsed ? 0 : 1,
                    width: this.collapsed ? 0 : 'auto'
                };
            },
            stepStyle() {
                return {
                    width: this.collapsed ? 0 : 'auto'
                };
            }
        },
        methods: {
            toggleCollapsed() {
                this.$emit('update:collapsed', !this.collapsed);
            }
        }
    };
});
