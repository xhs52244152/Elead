define([
    'text!' + ELMP.resource('biz-message/index.html'),
    ELMP.resource('biz-message/widget/WidgetMessage/index.js'),
    ELMP.resource('biz-message/widget/WidgetNotice/index.js'),
    'css!' + ELMP.resource('biz-message/index.css')
], function (template, MessageAbstract, NoticeAbstract) {
    'use strict';

    return {
        template,
        data() {
            return {
                visiable: false,

                noticeCount: 0,
                msgCount: 0,
                tabs: [
                    {
                        label: '消息',
                        name: 'message',
                        component: MessageAbstract
                    },
                    {
                        label: '公告',
                        name: 'notice',
                        component: NoticeAbstract
                    }
                ],
                activeName: 'message'
            };
        },
        computed: {
            allMsgCount() {
                return this.noticeCount + this.msgCount;
            }
        },
        methods: {
            handleClose() {
                this.visiable = false;
            },
            currentMsgCount(name) {
                if (name === 'message') {
                    return this.msgCount;
                }
                return this.noticeCount;
            },
            showMsgCount(name) {
                if (name === 'message') {
                    return this.msgCountShowFormat(this.msgCount);
                }
                return this.msgCountShowFormat(this.noticeCount);
            },
            msgCountShowFormat(count) {
                return count;
            },
            handleCountChange(option) {
                this[option.type] = option.count;
            },
            handleShow() {
                this.handleTabChange({
                    name: this.activeName
                });
            },
            handleTabChange(tab) {
                const tabName = tab.name;
                this.$nextTick(() => {
                    this.$refs[`${tabName}Ref`][0].showPage();
                });
            }
        }
    };
});
