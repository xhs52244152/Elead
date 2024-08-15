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
        视图表格管理: { CN: '视图表格管理', EN: 'View table management' },
        内部名称: { CN: '内部名称', EN: 'Internal Name' },
        表格键值: { CN: '表格键值', EN: 'Table key' },
        表格视图名称: { CN: '表格视图名称', EN: 'Table View Name' },
        创建视图: { CN: '创建视图', EN: 'Create View' },

        自动记忆: { CN: '自动记忆', EN: 'Automatic memory' },
        可添加条件: { CN: '可添加条件', EN: 'Conditions Add' },
        是否添加视图: { CN: '是否添加视图', EN: 'Add View' },
        是否修改: { CN: '是否修改', EN: 'Modify' },
        是否私有: { CN: '是否私有', EN: 'Private or not' },
        创建人: { CN: '创建人', EN: 'Creater' },
        操作: { CN: '操作', EN: 'Operation' },

        // 视图表格表单国际化
        显示名称: { CN: '显示名称', EN: 'Display Name' },
        主类型: { CN: '主类型', EN: 'Main Type' },
        类型: { CN: '类型', EN: 'Type' },
        已知条件: { CN: '已知条件', EN: 'Known conditions' },

        是否放弃编辑: {
            CN: '您是否确定放弃已更改内容？',
            EN: 'Are you sure you want to discard the changed content?'
        },
        可选列表: { CN: '可选列表', EN: 'Optional List' },
        已选列表: { CN: '已选列表', EN: 'Selected List' },

        // 视图列表国际化
        视图名称: { CN: '视图名称', EN: 'View Name' },
        负责人: { CN: '负责人', EN: 'Person Liable' },
        默认视图: { CN: '默认视图', EN: 'Default View' },
        启动视图: { CN: '启动视图', EN: 'Enable View' },
        视图类型: { CN: '视图类型', EN: 'View Type' },
        描述: { CN: '描述', EN: 'Description' },

        系统视图: { CN: '系统视图', EN: 'System View' },
        个人视图: { CN: '个人视图', EN: 'Personal View' },
        视图: { CN: '视图', EN: 'View' },
        冻结提示: {
            CN: '冻结规则为从左到右的列数',
            EN: 'The freezing rule is the number of columns from left to right'
        },

        请填写内部名称: { CN: '请填写表格键值', EN: 'Please fill in the Table key' },
        名称不能包含点: {
            CN: '表格键值格式错误：如果有“.”、“_”，请将其放到中间',
            EN: 'Table key format error: if there is "." or "_", please put it in the middle'
        },
        名称内容错误: {
            CN: '表格键值格式错误：请输入字母、数字或“.”、“_”',
            EN: 'Table key format error: Please enter letters, numbers , 、"_" or "."'
        },
        该键值与前端代码绑定: { 
            CN: '该键值与前端代码绑定',
            EN: 'This key value is bound to the front-end code'
        },
        '默认视图禁用': { CN: '默认视图无法禁用，请先修改默认视图', EN: 'The default view cannot be disabled, please change the default view'},
        '不能编辑': { CN: '不能编辑', EN: 'cannot be edited'},
        '不能删除': { CN: '不能删除', EN: 'cannot be delete'},
        '视图未启动': { CN: '视图未启动，请先启动视图', EN: 'View did not start, please start the view'},
        'defaultFilterConfig': { CN: '默认基础筛选字段配置', EN: 'Default Basic Filter Field Configuration' },
        'listDisplayConfig': { CN: '列表展示配置', EN: 'List display configuration'},
        'pageStyle': { CN: '分页样式', EN: 'Paging style'},
        'easy': { CN: '简易', EN: 'easy'},
        'standard': { CN: '标准', EN: 'standard'},
        'defaultSizePerPage': { CN: '每页默认数量', EN: 'Default quantity per page'},
        'pageLabel': { CN: '页签', EN: 'Page label'},
        'viewConfigItems': { CN: '视图配置项', EN: 'view configuration item'},
        'viewConfigDisabledTip': { CN: '视图表格自身视图表格的操作列必选，如取消将影响视图表格管理。', EN: 'The operation column of the view table itself is mandatory. Canceling it will affect the management of the view table'},
        'selectBoxType': { CN: '选择框类型', EN: 'Select box type'},
        'radio': { CN: '单选框', EN: 'radio'},
        'multipleChoice': { CN: '多选框', EN: 'multipleChoice'},
        'seqCol': { CN: '序号列', EN: 'Number column'},
        'selectBoxCol': { CN: '选择框列', EN: 'Select Box'},
        'iconCol': { CN: '图标列', EN: 'Icon Column'},
        'operationCol': { CN: '操作列', EN: 'Operation column'},
        'configBtn': { CN: '配置按钮', EN: 'configure button'},
        'refreshBtn': { CN: '刷新按钮', EN: 'Refresh button'},
        'advancedSearch': { CN: '高级筛选', EN: 'Advanced filtering'},
        'classifySearch': { CN: '分类筛选', EN: 'classify filtering'},
        'tabs': { CN: '页签', EN: 'Tabs'},
    };

    return {
        i18n: languageObj
    };
});
