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
        same: { CN: '相同', EN: 'Same' },
        different: { CN: '不相同', EN: 'Different' },
        notFoundDifferences: { CN: '未发现区别', EN: 'No differences found' },
        baselineComparison: { CN: '基线对比', EN: 'Baseline comparison' },
        property: { CN: '属性', EN: 'Property' },
        relationObject: { CN: '相关对象', EN: 'Relation Object' },
        onlyDisplayDifferent: { CN: '仅显示不同', EN: 'Only display different' },
        addComparisonObject: { CN: '增加比较对象', EN: 'Add Comparison Object' },
        fieldSettings: { CN: '字段设置', EN: 'Field Settings' },
        legend: { CN: '图例', EN: 'legend' },
        baseline: { CN: '基线', EN: 'baseline' },
        removeOrCropping: { CN: '删除/裁剪', EN: 'Remove Or Cropping' },
        projectManager: { CN: '项目经理', EN: 'Project Manager' },
        duration: { CN: '工期', EN: 'Duration' },
        stageFlag: { CN: '是否阶段', EN: 'Stage Flag' },
        responsiblePerson: { CN: '责任人', EN: 'Responsible Person' },
        project: { CN: '项目', EN: 'Project' },
        plan: { CN: '计划', EN: 'Plan' },
        requirement: { CN: '需求', EN: 'Requirement' },
        milestone: { CN: '里程碑', EN: 'Milestone' },
        budget: { CN: '预算', EN: 'Budget' },
        upToThree: { CN: '请不要超过基线对比上限，基线对比上限条数为3', EN: 'Check up to 3 data items at a time' },
        addObjectSuccess: { CN: '增加对象成功', EN: 'Adding object succeeded' }
    };

    return { i18n: languageObj };
});
