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
        'tips': { CN: '提示', EN: 'Tips' },
        'confirm': { CN: '确定', EN: 'Confirm' },
        'cancel': { CN: '取消', EN: 'Cancel' },
        'create': { CN: '创建', EN: 'Create' },
        'delete': { CN: '删除', EN: 'Delete' },
        'successfullyCreated': { CN: '创建成功', EN: 'Successfully created' },
        'creationFailure': { CN: '更新成功', EN: 'Creation failure' },
        'edit': { CN: '编辑', EN: 'Edit' },
        'more': { CN: '更多', EN: 'More' },
        'deleteConfirm': { CN: '你确定要删除数据吗？', EN: 'Are you sure you want to delete the data?' },
        'deletedSuccessfully': { CN: '删除成功', EN: 'Deleted successfully' },
        'createApplicationRules': { CN: '创建应用规则', EN: 'Create application rules' },
        'editApplicationRules': { CN: '编辑应用规则', EN: 'Edit application rules' },
        'clearConditions': { CN: '清空条件', EN: 'Clear Conditions' },
        'configureRules': { CN: '配置规则', EN: 'Configure Rules' },
        'configurationRuleSuccess': { CN: '配置成功', EN: 'Configuration Rule Success' },
        'objectType': { CN: '对象类型', EN: 'Object type' },
        'processTemplate': { CN: '流程模板', EN: 'Process template' },
        'operationScene': { CN: '操作场景', EN: 'Operation scene' },
        'sortOrder': { CN: '排序', EN: 'SortOrder' },
        'moveUp': { CN: '上移', EN: 'MoveUp' },
        'moveDown': { CN: '下移', EN: 'MoveDown' },
        'cannotMoveUp': { CN: '不能上移', EN: 'Cannot MoveUp' },
        'cannotMoveDown': { CN: '不能下移', EN: 'Cannot MoveDown' },
        'applicationRulesMoveTips': { CN: '仅支持同类别数据调整顺序，当前已是同类别数据', EN: 'Only data of the same type can be adjusted in sequence，The current data is in the same category' },
        'firstPlace': { CN: '首位', EN: 'First Place' },
        'lastPlace': { CN: '末位', EN: 'Last Place' },
        'moveUpSuccessfully': { CN: '上移成功', EN: 'MoveUp Successfully' },
        'moveDownSuccessfully': { CN: '下移成功', EN: 'MoveDown Successfully' },
        'moveUpFail': { CN: '上移失败', EN: 'MoveUp Fail' },
        'moveDownFail': { CN: '下移失败', EN: 'MoveDown Fail' },
        'pleaseSelectSubItem': { CN: '请选择子项', EN: 'Please select sub items' },
        
    }

    return {
        i18n: languageObj
    }
})
