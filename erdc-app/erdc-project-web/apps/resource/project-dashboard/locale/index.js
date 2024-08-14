/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        plan: {
            CN: '计划',
            EN: 'Plan'
        },
        ProjectSchedule: {
            CN: '项目进度报表',
            EN: 'Project Progress Report'
        },
        planSet: {
            CN: '各计划集任务分布',
            EN: 'Task distribution for plan set'
        },
        planRateSet: {
            CN: '各计划集完成率分布',
            EN: 'Completion rates for plan set'
        },
        taskReport: {
            CN: '任务报表',
            EN: 'Task Report'
        },
        planStateSet: {
            CN: '任务状态分布',
            EN: 'Task status distribution'
        },
        OverdueTask: {
            CN: '逾期任务列表',
            EN: 'Overdue Task List'
        },
        all: {
            CN: '所有',
            EN: 'All'
        },
        riskReport: {
            CN: '风险报表',
            EN: 'Risk Report'
        },
        issueReport: {
            CN: '问题报表',
            EN: 'Problem Report'
        },
        riskDistribution: {
            CN: '风险分布',
            EN: 'Risk distribution'
        },
        issueDistribution: {
            CN: '问题分布',
            EN: 'Issue distribution'
        },
        totalRisks: {
            CN: '风险总数',
            EN: 'Total risks'
        },
        totalIssues: {
            CN: '问题总数',
            EN: 'Total Issues'
        },
        requiremendReport: {
            CN: '需求进度报表',
            EN: 'Requirement Progress Report'
        },
        TaskRate: {
            CN: '任务完成率',
            EN: 'Task completion rate'
        },
        requiremendRate: {
            CN: '需求完成率',
            EN: 'Requirement completion rate'
        },
        riskRate: {
            CN: '风险完成率',
            EN: 'Risk completion rate'
        },
        issueRate: {
            CN: '问题完成率',
            EN: 'Problem completion rate'
        },
        projectRate: {
            CN: '项目工期完成率',
            EN: 'Project progress'
        },
        projectState: {
            CN: '项目当前状态',
            EN: 'Current status of the project'
        },
        demandSources: {
            CN: '需求来源分布',
            EN: 'Distribution of demand sources'
        },
        demandPriority: {
            CN: '需求优先级分布',
            EN: 'Demand priority distribution'
        },
        demandState: {
            CN: '需求状态分布',
            EN: 'Distribution of demand status'
        },
        demandReport: {
            CN: '需求报表',
            EN: 'Demand report'
        },
        byTypeStatus: {
            CN: '按类型和状态区分',
            EN: 'Type and status'
        },
        byLevel: {
            CN: '按等级区分',
            EN: 'Level'
        },
        byPriority: {
            CN: '按优先级区分',
            EN: 'Priority'
        },
        incompleteStatus: {
            CN: '未完成状态列表',
            EN: 'Incomplete status'
        },
        total: {
            CN: '总数',
            EN: 'Total'
        },
        source: {
            CN: '来源',
            EN: 'Source'
        },
        startDate: {
            CN: '开始日期',
            EN: 'Start Date'
        },
        endDate: {
            CN: '结束日期',
            EN: 'End Date'
        }
    };

    return { i18n: languageObj };
});
