define([], function () {
    return [
        {
            className: 'erd.cloud.ppm.project.entity.Project',
            tableKey: 'projectView',
            columns: [
                // {
                //     prop: 'icon',
                //     width: 40,
                //     align: 'center',
                //     slots: {
                //         default: 'icon'
                //     },
                //     fixed: 'left',
                //     // 扩展列，不参与列配置
                //     extraCol: true
                // },
                {
                    prop: 'identifierNo',
                    title: '项目编号'
                },
                {
                    prop: 'name',
                    title: '项目名称'
                },
                {
                    prop: 'typeReference',
                    title: '项目类型'
                },
                {
                    prop: 'projectManager',
                    title: '项目经理'
                },
                {
                    prop: 'timeInfo.scheduledStartTime',
                    title: '预计开始时间'
                },
                {
                    prop: 'timeInfo.scheduledEndTime',
                    title: '预计结束时间'
                }
            ]
        },
        {
            className: 'erd.cloud.ppm.issue.entity.Issue',
            tableKey: 'IssueView',
            columns: [
                {
                    prop: 'identifierNo',
                    title: '编号'
                },
                {
                    prop: 'name',
                    title: '名称'
                },
                {
                    prop: 'typeReference',
                    title: '类型'
                },
                {
                    prop: 'timeInfo.scheduledStartTime',
                    title: '开始时间'
                },
                {
                    prop: 'timeInfo.scheduledEndTime',
                    title: '结束时间'
                }
            ]
        },
        {
            className: 'erd.cloud.ppm.risk.entity.Risk',
            tableKey: 'RiskView',
            columns: [
                {
                    prop: 'identifierNo',
                    title: '编号'
                },
                {
                    prop: 'name',
                    title: '名称'
                },
                {
                    prop: 'typeReference',
                    title: '类型'
                },
                {
                    prop: 'timeInfo.scheduledStartTime',
                    title: '开始时间'
                },
                {
                    prop: 'timeInfo.scheduledEndTime',
                    title: '结束时间'
                }
            ]
        },
        {
            className: 'erd.cloud.ppm.require.entity.Requirement',
            tableKey: 'RequirementView',
            columns: [
                {
                    prop: 'identifierNo',
                    title: '编号'
                },
                {
                    prop: 'name',
                    title: '名称'
                },
                {
                    prop: 'typeReference',
                    title: '类型'
                },
                {
                    prop: 'timeInfo.scheduledStartTime',
                    title: '开始时间'
                },
                {
                    prop: 'timeInfo.scheduledEndTime',
                    title: '结束时间'
                }
            ]
        }
    ];
});
