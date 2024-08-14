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
        checkData: { CN: '请勾选数据', EN: 'Please check the data box' },
        baselineComparison: { CN: '基线对比', EN: 'Baseline comparison' },
        upToThree: { CN: '请不要超过基线对比上限，基线对比上限条数为3！', EN: 'Check up to 3 data items at a time' },
        code: { CN: '编码', EN: 'code' },
        name: { CN: '名称', EN: 'name' },
        version: { CN: '版本', EN: 'version' },
        type: { CN: '类型', EN: 'type' },
        context: { CN: '上下文', EN: 'context' },
        lifecycleStatus: { CN: '生命周期状态', EN: 'lifecycleStatus' },
        createdBy: { CN: '创建者', EN: 'createdBy' },
        updateBy: { CN: '修改者', EN: 'updatedBy' },
        updateTime: { CN: '修改时间', EN: 'update Time' }
    };

    return { i18n: languageObj };
});
