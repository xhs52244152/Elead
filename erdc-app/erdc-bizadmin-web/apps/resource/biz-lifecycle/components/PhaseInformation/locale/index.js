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
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '当前状态': { CN: '当前状态', EN: 'Current state' },
        '状态流转条件': { CN: '状态流转条件', EN: 'State flow condition' },
        '状态流转提示': { CN: '勾选转变条件，当对象操作了此转变条件时，当前状态可以向目标状态流转', EN: 'State flow condition' },
        '权限控制': { CN: '权限控制', EN: 'Access Control' },
        '关联流程': { CN: '关联流程', EN: 'Associated process' },
        '添加成员': { CN: '添加成员', EN: 'Add members' },
        '移除': { CN: '移除', EN: 'Remove' },
        '目标状态': { CN: '目标状态', EN: 'Target state' },
        '成员': { CN: '成员', EN: 'Member' },
        '操作': { CN: '操作', EN: 'Operation' },
        '获取权限列表表头失败': { CN: '获取权限列表表头失败', EN: 'Failed to get permissions list header' },
        '用户': { CN: '用户', EN: 'User' },
        '已选择': { CN: '已选择', EN: 'Selected' },
        '确认移除': { CN: '确认移除', EN: 'Confirm remove' },
        processName: { CN: '流程名称', EN: 'Process name' },
        selectProcess: { CN: '选择流程', EN: 'select a process' },
        pleaseSelectMember: { CN: '请先选择成员', EN: 'Please select members first' },
    }

    return {
        i18n: languageObj
    }
})
