define([], function () {
    return {
        i18n: {
            nodeProcessConfiguration: { CN: '处理信息', EN: 'Processing Infos' },
            processDesigner: { CN: '流程设计器', EN: 'Process Designer' },
            serialNumber: { CN: '节点顺序', EN: 'Serial Number' },
            isMail: { CN: '发送通知', EN: 'Send Notification' },
            pleaseFillIn: { CN: '请输入', EN: 'Please fill in' },
            routes: { CN: '路由配置', EN: 'Routes' },
            routeFlag: { CN: '路由标识', EN: 'Route Flag' },
            routeName: { CN: '名称', EN: 'Route Name' },
            sort: { CN: '排序', EN: 'Sort' },
            add: { CN: '增加', EN: 'Add' },
            operation: { CN: '操作', EN: 'Operation' },
            routesTips: {
                CN: '路由即当前节点审批可选的结论，对应当前节点之后流程可流转的分支。',
                EN: "Routing refers to the optional conclusion of the current node's approval, corresponding to the branches that the process can flow after the current node."
            },
            routeFlagTips: {
                CN: '路由标识仅支持“整数”格式，正数表示流程正向流转，根据模板配置的参与者正常审批情况流转。负数表示该路由是驳回，则当任意一个审批人选择此路由审批提交时，立即驳回到流程所配置的驳回节点。',
                EN: 'The route ID can only be in integer format. A positive number indicates the flow forward. The flow is based on the normal approval of participants configured in the template. A negative number indicates that the route is rejected. If an approver chooses this route to approve submission, the route is immediately rejected to the rejection node configured in the flow.'
            },
            repeatedRoute: {
                CN: '路由标识重复',
                EN: 'The route ID cannot be repeated'
            }
        }
    };
});
