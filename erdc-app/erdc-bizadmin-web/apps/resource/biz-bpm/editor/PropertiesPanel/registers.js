define([
    ELMP.resource('biz-bpm/editor/locale/index.js'),
    'erdcloud.kit'
], function({ i18n }) {

    const ErdcKit = require('erdcloud.kit');

    const getI18n = function(key) {
        const i18nMap = i18n[key];
        return {
            'zh-CN': i18nMap.CN,
            'zh_cn': i18nMap.CN,
            'en-US': i18nMap.EN,
            'en_us': i18nMap.EN
        };
    };

    // 流程基本信息
    const processBaseInfo = {
        name: 'processBaseInfo',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/ProcessBaseInfo/index.js'))
    };

    // 信号定义
    const processSignalDefinition = {
        name: 'processSignalDefinition',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/ProcessSignalDefinition/index.js'))
    };

    // 节点基本信息
    const nodeBaseInfo = {
        name: 'nodeBaseInfo',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/NodeBaseInfo/index.js'))
    };

    // 表单布局
    const AdvancedLayoutConfigure = {
        name: 'AdvancedLayoutConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedLayoutConfigure/index.js'))
    };

    // 到期日期
    const AdvancedDateConfigure = {
        name: 'AdvancedDateConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedDateConfigure/index.js'))
    };

    // 消息通知
    const AdvancedMessageConfigure = {
        name: 'AdvancedMessageConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedMessageConfigure/index.js'))
    };

    // 事件配置
    const AdvancedEventConfigure = {
        name: 'AdvancedEventConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedEventConfigure/index.js'))
    };

    // 路由配置
    const RouterConfiguration = {
        name: 'RouterConfiguration',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/NodeProcessConfiguration/index.js'))
    };

    // 流程属性
    const AdvancedProcessProperty = {
        name: 'ProcessProperty',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedProcessProperty/index.js'))
    };

    // 服务的处理信息
    const ServiceTask = {
        name: 'ServiceTask',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/ServiceTask/index.js'))
    };

    // 邮件的处理信息
    const MailProcessInformation = {
        name: 'MailProcessInformation',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/MailProcessInformation/index.js'))
    };

    // 信号事件
    const SignalCaptureEvent = {
        name: 'SignalCaptureEvent',
        onlyRule: /SignalEventDefinition$/i,
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/SignalCaptureEvent/index.js'))
    };

    // 定时事件
    const TimingEvent = {
        name: 'TimingEvent',
        onlyRule: /TimerEventDefinition$/i,
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/TimingCaptureEvents/index.js'))
    };

    // 错误事件
    const ErrorEvent = {
        name: 'ErrorEvent',
        onlyRule: /ErrorEventDefinition$/i,
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/BoundaryEvent/index.js'))
    };

    // 流条件
    const SequenceFlow = {
        name: 'SequenceFlow',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/SequenceFlow/index.js'))
    };

    // 签名信息
    const AdvancedSignConfigure = {
        name: 'AdvancedSignConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedSignConfigure/index.js'))
    };

    // 跳转规则
    const AdvancedHandlerConfigure = {
        name: 'AdvancedHandlerConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedHandlerConfigure/index.js'))
    };

    // 参与者配置
    const AdvancedParticipantConfigure = {
        name: 'AdvancedParticipantConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedParticipantConfigure/index.js'))
    };

    // 审批人配置
    const AdvancedApproverConfigure = {
        name: 'AdvancedApproverConfigure',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/AdvancedApproverConfigure/index.js'))
    };

    // 网关
    const GatewayInfo = {
        name: 'gatewayInfo',
        component: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/GatewayInfo/index.js'))
    }

    return [
        // 流程图
        {
            rule: /Process$/i,
            tabs: [
                // 基本配置
                {
                    name: 'globalConfigs',
                    label: getI18n('globalConfigs'),
                    components: [
                        processBaseInfo,
                        processSignalDefinition
                    ]
                },
                // 高级配置
                {
                    name: 'advancedConfiguration',
                    label: getI18n('advancedConfiguration'),
                    components: [
                        AdvancedProcessProperty,
                        AdvancedApproverConfigure,
                        AdvancedLayoutConfigure,
                        // AdvancedDateConfigure,
                        AdvancedMessageConfigure,
                        AdvancedEventConfigure,
                        AdvancedSignConfigure
                    ]
                }
            ]
        },
        {
            rule: /(StartEvent|EndEvent)$/i,
            tabs: [
                // 基本配置
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        SignalCaptureEvent
                    ]
                },
                // 高级配置
                {
                    name: 'advancedConfiguration',
                    label: getI18n('advancedConfiguration'),
                    components: [
                        AdvancedProcessProperty,
                        AdvancedEventConfigure
                    ]
                }
            ]
        },
        {
            rule: /(UserTask)$/i,
            tabs: [
                // 基本配置
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        RouterConfiguration
                    ]
                },
                // 高级配置
                {
                    name: 'advancedConfiguration',
                    label: getI18n('advancedConfiguration'),
                    components: [
                        AdvancedProcessProperty,
                        AdvancedParticipantConfigure,
                        // AdvancedApproverConfigure,
                        AdvancedLayoutConfigure,
                        // AdvancedDateConfigure,
                        AdvancedHandlerConfigure,
                        AdvancedMessageConfigure,
                        AdvancedEventConfigure,
                        AdvancedSignConfigure
                    ]
                }
            ]
        },
        {
            rule: /Gateway$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo
                    ]
                }
            ]
        },
        {
            rule: /ServiceTask$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        ServiceTask
                    ]
                },
                {
                    name: 'advancedConfiguration',
                    label: getI18n('advancedConfiguration'),
                    components: [
                        AdvancedEventConfigure
                    ]
                }
            ]
        },
        {
            rule: /SendTask$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        MailProcessInformation
                    ]
                },
                {
                    name: 'advancedConfiguration',
                    label: getI18n('advancedConfiguration'),
                    components: [
                        AdvancedEventConfigure
                    ]
                }
            ]
        },
        {
            rule: /IntermediateCatchEvent$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        SignalCaptureEvent,
                        TimingEvent
                    ]
                },
                {
                    name: 'advancedConfiguration',
                    label: getI18n('advancedConfiguration'),
                    components: [
                        AdvancedEventConfigure
                    ]
                }
            ]
        },
        {
            rule: /BoundaryEvent$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        SignalCaptureEvent,
                        TimingEvent,
                        ErrorEvent
                    ]
                }
            ]
        },
        {
            rule: /SequenceFlow$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo,
                        SequenceFlow
                    ]
                }
            ]
        },
        // 一定要放到最后
        {
            rule: /\w+$/i,
            tabs: [
                {
                    name: 'nodeConfigs',
                    label: getI18n('nodeConfigs'),
                    components: [
                        nodeBaseInfo
                    ]
                }
            ]
        }
    ];
});
