/**
 * i18n国际化文件
 * **/
define(['erdcloud.i18n'], function (i18n) {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        confirm: {
            CN: '确定',
            EN: 'confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        tip: {
            CN: '提示',
            EN: 'tip'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        selectData: {
            CN: '请选择必填项',
            EN: 'Please select the required datas'
        },
        confirmDelete: {
            CN: '确认删除该数据？',
            EN: 'Are you sure to delete this data?'
        },
        deleteTip: {
            CN: '确认删除',
            EN: 'confirm delete'
        },
        add: {
            CN: '增加',
            EN: 'Add'
        },
        addIssues: {
            CN: '创建问题',
            EN: 'Create Issues'
        },
        addSupervise: {
            CN: '创建督办任务',
            EN: 'Create Supervise the task'
        },
        addRisk: {
            CN: '创建风险',
            EN: 'Create Risk'
        },
        remove: {
            CN: '删除',
            EN: 'remove'
        },
        deleteSuccess: {
            CN: '移除成功',
            EN: 'deleteSuccess'
        },
        recoverItem: {
            CN: '恢复',
            EN: 'recoverItem'
        },
        cutItem: {
            CN: '裁剪',
            EN: 'cutItem'
        },
        conclution: {
            CN: '请选择结论！',
            EN: 'Select a conclusion!'
        },
        conclute: {
            CN: '结论',
            EN: 'conclusion'
        },
        description: {
            CN: '描述',
            EN: 'description'
        },
        keyWord: {
            CN: '请输入关键词搜索',
            EN: 'Enter keywords to search'
        },
        detaiInfo: {
            CN: '详细信息',
            EN: 'detail info'
        },
        warningInfo: {
            CN: '下载数据未准备好，请稍后再试!',
            EN: 'Download data not ready, please try again later!'
        },
        auditConclusion: {
            CN: '审核结论',
            EN: 'Audit conclusion'
        },
        preExaminationConclusion: {
            CN: '预审结论',
            EN: 'Pre examination conclusion'
        },
        reviewConclusion: {
            CN: '正审结论',
            EN: 'Conclusion of the review'
        },
        viewDeliveryList: {
            CN: '查看交付件清单',
            EN: 'View delivery list'
        },
        handleTask: {
            CN: '督办任务',
            EN: 'Handle task'
        },
        risk: {
            CN: '风险',
            EN: 'Risk'
        },
        issue: {
            CN: '问题',
            EN: 'Issue'
        },
        startProcess: {
            CN: '发起流程',
            EN: 'Start process'
        },
        reviewType: {
            CN: '评审类型',
            EN: 'Review type'
        },
        reviewPoints: {
            CN: '评审点',
            EN: 'Review points'
        },
        operationSuccessful: {
            CN: '操作成功',
            EN: 'Operation successful'
        },
        viewQualityObjectives: {
            CN: '查看质量目标',
            EN: 'View quality objectives'
        },
        area: {
            CN: '领域',
            EN: 'Area'
        },
        passingRate: {
            CN: '通过率（%）',
            EN: 'Passing rate (%)'
        },
        category: {
            CN: '类别',
            EN: 'Category'
        },
        viewReviewElements: {
            CN: '查看评审要素',
            EN: 'View review elements'
        },
        deleteSuccessful: {
            CN: '删除成功',
            EN: 'Delete successful'
        },
        notGroup: {
            CN: '不分组',
            EN: 'Not group'
        },
        group: {
            CN: '分组',
            EN: 'Grouping'
        },
        associatedMilestone: {
            CN: '关联里程碑',
            EN: 'Associated Milestones'
        }
    };

    return { i18n: languageObj, i18nMappingObj: i18n.wrap({ i18n: languageObj }) };
});
