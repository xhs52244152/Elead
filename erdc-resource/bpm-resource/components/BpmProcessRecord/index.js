define([
    'text!' + ELMP.resource('bpm-resource/components/BpmProcessRecord/template.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmProcessRecord/style.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js'))
        },
        props: {
            processRecord: {
                type: Array,
                default() {
                    return [];
                }
            },
            userInfo: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmProcessRecord/locale/index.js'),
                APPROVED_IMG:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAfZJREFUKBWdU0trU0EU/s7chjY0lqQUxPhOjSI1WogU+looiIturYgLEVyELgRBFBeuLegP0IAL3VbEpRYLUtLuLK3WUlAakdJoQXIrXkhrvBnnm2akELNxFnPOmfM+5xvBzpPPR/ak5CpERqGlV0THtZYNiF6QmkyUPodPkctVnYs4ZvfrfMaD9xyCtHtroFp/DFG7sH4ut0iddaajEm/WCLv2t8WC293Z2FAiic5IG/zqFgr+Gu6vzAWrm0FMAz9rOhxkAIEpNZnylpjxfNfBysPMmWir8hqSbtVCjC2+qUx+/xKFxqdSMexR2z0izYzNHBmJAamnHRPRTwnkIpUs9V8ZK+FvXJ5/hRtL0zbArVQ2RnsOVWlBL/nhxF4SLAdlvP2xbvkN0++l+ZeYLq8hUm9lqDNpddxGi+HilBKRVvt47f0Uvv2q6HtH++Xx6gcTzMfYgQzupvusnkPk4RqVieBTKFc3SfDoxFm0qxa5uVywjne6T/91pN6v23H/pmf9jo8zfokEJzu68CI7gsPRDowfG8D1Q6fsu7sK5W07Akdp6AkquEeug+dIexwzA6O4su+4ld1F/YPiXECZiFNfi/oJ90YAcI8ugHNw1O2ZdjBII1SbIozT5xA5C5bKjI0Iq4f+b2y70gjVZr/KlPrMtrjjV/0B35HzP6spPCMAAAAASUVORK5CYII=',
                REJECTED_IMG:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAP9JREFUKBWdkz0OgkAQhbeAeAS4hB4ILCzgcF4Br6GFNlhjZ0mD75NZdyGGKCQvO29+d2YH56JvcC4VaqEROqG3E14JaeQeRBm2wk0YFnDFL0RJQiE8LeissxRyIREy4+hJjN+YQAJX9RWPkjeTzEbQC9hJgH9KVXpEQWYcDkIr7IjjNI4e+0XAv8Z4MlKaM4EYH0JhJ7w1+14yvCGYqUKyqBKB6Dzg/ibMAn1HcG8kIZhPnIo+kLMYLW8bM0LXx5VzC6THpcpM/1N53vPdjD/1/O+0/XtXXHvNO7Np46pK+LZh9MaGMV2ex1cMGxZNcd1uRwlogRk0wvyvQj/5q15t6yFR01BnmAAAAABJRU5ErkJggg=='
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'name',
                        width: 160,
                        title: this.i18n.processingNode // 处理节点
                    },
                    {
                        prop: 'participant',
                        width: 120,
                        title: this.i18n.participant // 参与者
                    },
                    {
                        prop: 'user',
                        width: 320,
                        title: this.i18n.user // 处理人
                    },
                    {
                        prop: 'result',
                        width: 120,
                        title: this.i18n.result // 处理结果
                    },
                    {
                        prop: 'elapsed',
                        width: 120,
                        title: this.i18n.elapsed // 处理时长
                    },
                    {
                        prop: 'time',
                        width: 180,
                        title: this.i18n.time // 处理时间
                    },
                    {
                        prop: 'opinions',
                        minWidth: 80,
                        title: this.i18n.opinion // 处理意见
                    }
                ];
            },
            recordData() {
                return _.map(this.processRecord, (item) => ({
                    ...item,
                    memberName: JSON.parse(item.memberNameStr || '{}')[item.taskName],
                    userInfo: this.initUsersInfo(item.userId),
                    elapsedTime: this.elapsed(item.startTime, item.time)
                }));
            }
        },
        methods: {
            initUsersInfo(userId) {
                const users = userId ? userId.split('>') : [];
                let approveUser = [];
                let transformed = [];
                if (users[0]) {
                    approveUser = _.map(users[0].split(','), (id) => _.find(this.userInfo, { id }) || { id: id });
                }
                if (users[1]) {
                    transformed = _.map(users[1].split(','), (id) => _.find(this.userInfo, { id }) || { id: id });
                }
                return {
                    approveUser,
                    transformed
                };
            },
            elapsed(DateOne, DateTwo) {
                let timeConsuming = (new Date(DateTwo) - new Date(DateOne)) / (60 * 1000);
                if (timeConsuming !== timeConsuming) {
                    return { type: '-' };
                }

                if (timeConsuming < 60) {
                    return {
                        type: 'm',
                        time: Math.ceil(timeConsuming),
                        elapsed: this.i18n.lessThanOneHour
                    };
                } else if (timeConsuming >= 60 && timeConsuming < 24 * 60) {
                    timeConsuming = timeConsuming / 60;
                    return {
                        type: 'h',
                        time: ~~timeConsuming,
                        elapsed: ~~timeConsuming + this.i18n.hour
                    };
                } else {
                    timeConsuming = timeConsuming / (24 * 60);
                    return {
                        type: 'd',
                        time: Math.round(timeConsuming),
                        elapsed: Math.round(timeConsuming) + this.i18n.day
                    };
                }
            }
        }
    };
});
