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
        动态脚本管理: { CN: '动态脚本管理', EN: 'Dynamic script management' },
        创建动态脚本: { CN: '创建动态脚本', EN: 'Create dynamic script' },
        编辑动态脚本: { CN: '编辑动态脚本', EN: 'Update dynamic script' },
        ApiPlaceholder: {
            CN: '应用接口根据“内部名称”查询可用脚本',
            EN: 'Application interface queries available scripts based on internal names'
        },
        apiCallPlaceholder: {
            CN: '接口调用根据此调用方法识别调用脚本，如有多个方法请用“，”隔开',
            EN: 'Interface calls identify calling scripts based on this calling method. If there are multiple methods, please separate them with ","'
        },
        introduceScript: { CN: '请介绍脚本实现功能', EN: 'Please introduce the script implementation function' },
        请选择: { CN: '请选择', EN: 'Please select' },
        请选择文件: { CN: '请选择文件', EN: 'Please select file' },
        启用: { CN: '启用', EN: 'Enable' },
        禁用: { CN: '禁用', EN: 'Disable' },
        确定: { CN: '确定', EN: 'Confirm' },
        取消: { CN: '取消', EN: 'Cancel' },
        创建成功: { CN: '创建成功', EN: 'Create successfully' },
        更新成功: { CN: '更新成功', EN: 'Update successfully' },
        删除成功: { CN: '删除成功', EN: 'Delete successfully' },
        启用成功: { CN: '启用成功', EN: 'Enable successfully' },
        禁用成功: { CN: '禁用成功', EN: 'Disable successfully' },
        提示: { CN: '提示', EN: 'Tips' },
        是否删除: { CN: '是否删除', EN: 'Delete or not' },
        是否删除附件: { CN: '是否删除附件', EN: 'Whether to delete attachments' },
        exceedsLimit: { CN: '上传文件超过数量限制', EN: 'Uploading files exceeds the quantity limit' }
    };

    return {
        i18n: languageObj
    };
});
