define([
    'erdcloud.kit',
    'text!' + ELMP.resource('biz-message/MessageOverview/index.html'),
    'css!' + ELMP.resource('biz-message/MessageOverview/index.css')
], function (erdcloudKit, template) {
    'use strict';
    return {
        template,
        data() {
            return {
                activeName: '',
                tabs: [
                    {
                        label: '消息',
                        name: 'message',
                        component: erdcloudKit.asyncComponent(
                            ELMP.resource('biz-message/MessageOverview/ReceivedMessage/index.js')
                        )
                    },
                    {
                        label: '公告',
                        name: 'notice',
                        component: erdcloudKit.asyncComponent(
                            ELMP.resource('biz-message/MessageOverview/ReceivedNotice/index.js')
                        )
                    }
                ]
            };
        },
        computed: {
            active() {
                return this.$route.query.active || '';
            }
        },
        watch: {
            active: {
                handler(newVal) {
                    this.setTabsActiveName(newVal);
                },
                immediate: true
            }
        },
        methods: {
            setTabsActiveName(activeName) {
                if (activeName) {
                    this.activeName = activeName;
                } else {
                    if (this.tabs.length) {
                        this.activeName = this.tabs[0].name;
                    }
                }
            },
            handleTriggerClick() {}
        }
    };
});
