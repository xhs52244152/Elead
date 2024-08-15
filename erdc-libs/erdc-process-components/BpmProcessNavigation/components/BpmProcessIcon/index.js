define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessIcon/template.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessIcon/index.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');
    const ICON_TYPE_DEFAULT = 'DEFAULT';
    const ICON_TYPE_FINISHED = 'FINISHED';
    const ICON_TYPE_CURRENT = 'CURRENT';
    const ICON_TYPE_ABNORMAL = 'ABNORMAL';
    const ICON_TYPE_SUSPENDED = 'SUSPENDED';
    return {
        name: 'BpmProcessIcon',
        template,
        components: {
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js'))
        },
        props: {
            activity: Object,
            type: {
                type: String,
                default() {
                    return ICON_TYPE_DEFAULT;
                }
            },
            placement: {
                type: String,
                default: 'top-start'
            },
            // 是否是子节点
            isChildNode: {
                type: Boolean,
                default: false
            },
            // 是否是纵向
            vertical: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessIcon/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['处理人']),
                ICON_TYPE_DEFAULT,
                ICON_TYPE_FINISHED,
                ICON_TYPE_CURRENT,
                ICON_TYPE_ABNORMAL,
                ICON_TYPE_SUSPENDED,
                iconType: {
                    ICON_TYPE_FINISHED: {
                        class: 'el-icon-check',
                        style: {
                            color: 'var(--primary-color)'
                        }
                    },
                    ICON_TYPE_CURRENT: {
                        class: 'el-icon-s-custom',
                        style: {
                            color: 'var(--primary-color)'
                        }
                    },
                    ICON_TYPE_ABNORMAL: {
                        class: 'el-step__icon workflow-thumbnail-icon-default',
                        style: {
                            'background-color': '#f5222d'
                        }
                    },
                    ICON_TYPE_SUSPENDED: {
                        class: 'el-icon-minus',
                        style: {
                            color: '#f5222d'
                        }
                    },
                    ICON_TYPE_DEFAULT: {
                        class: 'el-step__icon workflow-thumbnail-icon-default'
                    }
                }
            };
        }
    };
});
