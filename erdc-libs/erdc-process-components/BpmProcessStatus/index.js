define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessStatus/template.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessStatus/index.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');
    return {
        name: 'BpmProcessStatus',
        template,
        props: {
            // 状态
            status: {
                type: String,
                default: '',
                required: true
            },
            // 标题
            title: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-process-components/BpmProcessStatus/locale/index.js')
            };
        },
        computed: {
            processStateList() {
                return [
                    {
                        label: this.i18n.running, // 进行中
                        value: 'LIFECYCLE_RUNNING'
                    },
                    {
                        label: this.i18n.completed, // 结束
                        value: 'LIFECYCLE_COMPLETED'
                    },
                    {
                        label: this.i18n.suspended, // 挂起
                        value: 'LIFECYCLE_SUSPENDED'
                    },
                    {
                        label: this.i18n.exception, // 异常
                        value: 'LIFECYCLE_EXCEPTION'
                    }
                ];
            },
            processTitle() {
                let { label = '--' } = _.find(this.processStateList, { value: this.status }) || {};
                return this.title || label;
            },
            processStatus() {
                return this.status;
            }
        }
    };
});
