define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHelp/template.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessHelp/index.css'),
], function (template) {

    return {
        name: 'BpmProcessHelp',
        template,
        props: {
            iconSize: {
                type: String,
                default: '12px'
            },
            placement: {
                type: String,
                default: 'bottom-start'
            }
        },
        data() {
            return {
                thumbnailHelpList: [
                    {
                        borderBorderColor: '',
                        iconClass: 'el-icon-s-custom theme-font-color',
                        title: '进行中'
                    },
                    {
                        borderBorderColor: '',
                        iconClass: 'el-icon-check theme-font-color',
                        title: '已完成'
                    },
                    {
                        borderBorderColor: 'item-icon-default',
                        iconClass: 'workflow-thumbnail-icon-default',
                        title: '未完成'
                    },
                    {
                        borderBorderColor: 'item-icon-pending',
                        iconClass: 'workflow-thumbnail-icon-abnormal',
                        title: '异常'
                    },
                    {
                        borderBorderColor: 'item-icon-pending',
                        iconClass: 'el-icon-minus item-icon-i-pending',
                        title: '挂起'
                    }
                ]
            }
        }
    };
});
