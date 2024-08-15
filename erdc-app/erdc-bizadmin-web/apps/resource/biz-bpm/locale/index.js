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
            '组件提示': { CN: (o, t) => `请${(o === 'i' ? '输入' : '选择') + '' + t}`, EN: (o, t) => `Please ${(o === 'i' ? 'input' : 'select') + ' ' + t}` },
            '导入发布标识': { CN: '导入发布标识', EN: 'Import publish identity' },
            '导入节点配置': { CN: '导入节点配置', EN: 'Import node configuration' },
            '选择文件': { CN: '选择文件', EN: 'Select file' },
            '导入成功': { CN: '导入成功', EN: 'Import successfully' },
            '导入失败': { CN: '导入失败', EN: 'Import failure' },
            '请选择文件': { CN: '请选择文件', EN: 'Please select file' },
            '流程模板': { CN: '流程模板', EN: 'Process template' },
            '新模板名称': { CN: '新模板名称', EN: 'New template name' },
            '新模板标识': { CN: '新模板标识', EN: 'New template identification' },
            '新模板标识规则': { CN: '新模板标识以字母或$或_开头，可以包含字母、数字和特殊字符$_-', EN: 'The new template identifier starts with a letter or $or _ and can contain letters, numbers, and special characters $_-' },
            '调用时间': { CN: '调用时间', EN: 'Call time' },
            '处理时间': { CN: '处理时间', EN: 'Processing time' },
            '接口状态': { CN: '接口状态', EN: 'Interface status' },
            '接口参数': { CN: '接口参数', EN: 'Interface parameter' },
            '返回数据': { CN: '返回数据', EN: 'Return data' },
            '流程实例Id': { CN: '流程实例Id', EN: 'Process instance Id' },
            '流程定义key': { CN: '流程定义key', EN: 'Process definition key' },
            '流程名称': { CN: '流程名称', EN: 'Process name' },
            '任务key值': { CN: '任务key值', EN: 'Task key value' },
            '任务Id': { CN: '任务Id', EN: 'Task Id' },
            '接口路径': { CN: '接口路径', EN: 'Interface path' },
            '状态': { CN: '状态', EN: 'state' },
            '调用方式': { CN: '调用方式', EN: 'Calling mode' },
            '接口类型': { CN: '接口类型', EN: 'Interface type' },
            '操作用户': { CN: '操作用户', EN: 'Operating user' },
            '调用日期': { CN: '调用日期', EN: 'Call date' },
            '参数': { CN: '参数', EN: 'parameter' },
            '结果数据': { CN: '结果数据', EN: 'Result data' },
            '查看流程实例详情失败': { CN: '查看流程实例详情失败', EN: 'Description Failed to view process instance details' },
            '接口分类': { CN: '接口分类', EN: 'Interface classification' },
            '接口名称': { CN: '接口名称', EN: 'Interface name' },
            '接口地址': { CN: '接口地址', EN: 'Interface address' },
            '分组': { CN: '分组', EN: 'Group' },
            '方法': { CN: '方法', EN: 'Method' },
            '请求方法': { CN: '请求方法', EN: 'Request method' },
            '消息发送方式': { CN: '消息发送方式', EN: 'Message sending mode' },
            'Dubbo版本': { CN: 'Dubbo版本', EN: 'Doubbo version' },
            '失败重试': { CN: '失败重试 /次', EN: 'Failed retry /time' },
            '重试间隔': { CN: '重试间隔 /秒', EN: 'Retry interval /seconds' },
            '描述': { CN: '描述', EN: 'Description' },
            '业务接口': { CN: '业务接口', EN: 'Service interface' },
            '处理接口': { CN: '处理接口', EN: 'Processing interface' },
            '用户': { CN: '用户', EN: 'User' },
            '角色': { CN: '角色', EN: 'Role' },
            '生命周期': { CN: '生命周期', EN: 'Life cycle' },
            '全部实例': { CN: '全部实例', EN: 'All instances' },
            '全局一次': { CN: '全局一次', EN: 'Global once' },
            '单一实例': { CN: '单一实例', EN: 'Single instance' },
            '同步': { CN: '同步', EN: 'synchronization' },
            '异步': { CN: '异步', EN: 'asynchronous' },
            '失败重试格式不正确': { CN: '失败重试格式不正确', EN: 'The format of the failed retry is incorrect' },
            '重试间隔格式不正确': { CN: '重试间隔格式不正确', EN: 'The retry interval format is incorrect' },
            '请输入正确的json数据': { CN: '请输入正确的json数据', EN: 'Please enter correct json data' },
            'Dubbo接口': { CN: 'Dubbo接口', EN: 'Doubbo interface' },
            '显示名称': { CN: '显示名称', EN: 'Display name' },
            '确定': { CN: '确 定', EN: 'Confirm' },
            '取消': { CN: '取 消', EN: 'Cancel' },
            '查询历史版本失败': { CN: '查询历史版本失败', EN: 'Failed to query the historical version. Procedure' },
            '版本': { CN: '版本', EN: 'version' },
            'Doubbo版本': { CN: 'Doubbo版本', EN: 'Doubbo version' },
            versionStatus: { CN: '版本状态', EN: 'Version status' },
            '流程模板名称': { CN: '流程模板名称', EN: 'Process template name' },
            '流程节点名称': { CN: '流程节点名称', EN: 'Process node name' },
            '流程模板版本': { CN: '流程模板版本', EN: 'Process template version' },
            '操作': { CN: '操作', EN: 'operation' },
            '获取关联的流程定义失败': { CN: '获取关联的流程定义失败', EN: 'Failed to obtain the associated process definition' },
            '流程图': { CN: '流程图', EN: 'Flow chart' },
            '流程图解': { CN: '流程图解', EN: 'Flow diagram' },
            '参与者类型': { CN: '参与者类型', EN: 'Participant type' },
            '请选择参与者类型': { CN: '请选择参与者类型', EN: 'Please select a participant type' },
            '参与者': { CN: '参与者', EN: 'participant' },
            '请选择参与者': { CN: '请选择参与者', EN: 'Please select participants' },
            '处理人': { CN: '处理人', EN: 'handler' },
            '请选择处理人': { CN: '请选择处理人', EN: 'Please select a handler' },
            '处理人配置不合法': { CN: '处理人配置不合法', EN: 'The handler configuration is invalid' },
            '获取参与者配置失败': { CN: '获取参与者配置失败', EN: 'Failed to get the participant configuration' },
            '创建': {CN: '创建', EN: 'Create'},
            '创建流程': {CN: '创建流程', EN: 'Create process'},
            '更多操作': {CN: '更多操作', EN: 'More operations'},
            '复制流程': {CN: '复制流程', EN: 'Copy process'},
            '导入流程': {CN: '导入流程', EN: 'Import process'},
            '请输入流程名称，模块': {CN: '请输入流程名称，模块', EN: 'Please enter process name, module'},
            '复制': {CN: '复制', EN: 'Copy'},
            '导入': {CN: '导入', EN: 'Import'},
            '导出': {CN: '导出', EN: 'Export'},
            '清空': {CN: '清空', EN: 'Empty'},
            '创建父类型': {CN: '创建父类型', EN: 'Create parent type'},
            '确认删除流程类型吗': {
                CN: title => '确认删除流程类型[' + title + ']吗？',
                EN: title => 'Are you sure the delete process type [' + title + ']?'
            },
            '提示': {CN: '提示', EN: 'Prompt'},
            '流程类型': {CN: '流程类型', EN: 'Process type'},
            '流程类型名称不能为空且不能含有空格': {
                CN: '流程类型名称不能为空且不能含有空格',
                EN: 'The process type name cannot be empty and cannot contain Spaces'
            },
            '更多': {CN: '更多', EN: 'More'},
            '编辑': {CN: '编辑', EN: 'Edit'},
            '启用': {CN: '启用', EN: 'Enable'},
            '禁用': {CN: '禁用', EN: 'Disable'},
            '撤销编辑': {CN: '撤销编辑', EN: 'Unedit'},
            '删除模板': {CN: '删除', EN: 'Delete'},
            'BPMN': {CN: 'BPMN', EN: 'BPMN'},
            '流程启用提示': {
                CN: s => s === 's' ? '流程启用成功' : '流程启用失败',
                EN: s => s === 's' ? 'Process enabled successfully' : 'Process enablement failure'
            },
            '流程禁用提示': {
                CN: s => s === 's' ? '流程禁用成功' : '流程禁用失败',
                EN: s => s === 's' ? 'Process disabled successfully' : 'Process disabling failure'
            },
            '流程删除提示': {
                CN: s => s === 's' ? '流程删除成功' : '流程删除失败',
                EN: s => s === 's' ? 'Process deletion succeeded' : 'Process deletion failure'
            },
            '撤销编辑提示': {
                CN: s => s === 's' ? '撤销编辑成功' : '撤销编辑失败',
                EN: s => s === 's' ? 'Undo edit successfully' : 'Unedit failure'
            },
            '你确定要撤销编辑吗？': {CN: '你确定要撤销编辑吗？', EN: 'Are you sure you want to undo the edits?'},
            '请勾选需要导出的数据': {CN: '请勾选需要导出的数据', EN: 'Select the data you want to export'},
            '流程模板复制成功': {CN: '流程模板复制成功', EN: 'The process template is copied successfully'},
            '流程模板复制失败': {CN: '流程模板复制失败', EN: 'Process template replication failed'},
            '搜索关键字': {CN: '搜索关键字', EN: 'Search keyword'},
            '请输入模板名称': {CN: '请输入模板名称', EN: 'Please enter a Template name'},
            '不能增加': {
                CN: '当前租户不能在此分类下添加子分类',
                EN: 'The current tenant cannot add subcategories under this category'
            },
            '不能删除': {CN: '当前租户不能删除此分类', EN: 'The current tenant cannot delete this category'},
            '不能编辑': {CN: '当前租户不能编辑此分类', EN: 'The current tenant cannot edit this category'},
            '请选择流程类型': {CN: '请选择流程类型', EN: 'Please select a process type'},
            '流程删除成功': {CN: '流程删除成功', EN: 'The process is successfully deleted'},
            '流程删除失败': {CN: '流程删除失败', EN: 'The process fails to be deleted'},
            '新建成功': {CN: '新建成功', EN: 'Successful creation'},
            '新建失败': {CN: '新建失败', EN: 'New creation failure'},
            '更新成功': {CN: '更新成功', EN: 'Update successfully'},
            '更新失败': {CN: '更新失败', EN: 'Update failure'},
            '删除成功': {CN: '删除成功', EN: 'Deleted successfully'},
            '删除失败': {CN: '删除失败', EN: 'Deletion failure'},
            '撤销编辑成功': {CN: '撤销编辑成功', EN: 'Undo edit successfully'},
            '撤销编辑失败': {CN: '撤销编辑失败', EN: 'Unedit failure'},
            '流程禁用成功': {CN: '流程禁用成功', EN: 'Process disabled successfully'},
            '流程禁用失败': {CN: '流程禁用失败', EN: 'Process disabling failure'},
            '流程启用成功': {CN: '流程启用成功', EN: 'Process enabled successfully'},
            '流程启用失败': {CN: '流程启用失败', EN: 'Process enablement failure'},
            '确认删除': {CN: '确认删除', EN: 'Confirm delete'},
            '确认删除吗': {
                CN: '确定后将删除整个流程模板，无法撤回！',
                EN: 'After confirmation, the entire process template will be deleted and cannot be recalled!'
            },
            '流程检入成功': {CN: '流程检入成功', EN: 'Procedure check in successfully'},
            '流程检入失败': {CN: '流程检入失败', EN: 'Process check-in failed'},
            '流程检出成功': {CN: '流程检出成功', EN: 'The process was successfully detected'},
            '流程检出失败': {CN: '流程检出失败', EN: 'Process check out failed'},
            '查看记录': {CN: '查看记录', EN: 'View record'},
            '重试': {CN: '重试', EN: 'Retry'},
            '流程实例详情': {CN: '流程实例详情', EN: 'Process instance details'},
            '接口调用成功': {CN: '接口调用成功', EN: 'Interface call success'},
            '接口调用失败': {CN: '接口调用失败', EN: 'Interface call failure'},
            '获取历史记录失败': {CN: '获取历史记录失败', EN: 'Failed to get the historical record'},
            '请输入流程名称': {CN: '请输入流程名称', EN: 'Please enter a process name'},
            '调用日志': {CN: '调用日志', EN: 'Call log'},
            '删除': {CN: '删除', EN: 'Delete'},
            '查看接口': {CN: '查看接口', EN: 'View interface'},
            '新增接口': {CN: '新增接口', EN: 'New interface'},
            '编辑接口': {CN: '编辑接口', EN: 'Editing interface'},
            '创建成功': {CN: '创建成功', EN: 'Successfully created'},
            '创建失败': {CN: '创建失败', EN: 'Creation failure'},
            '请勾选要删除的数据': {CN: '请勾选要删除的数据', EN: 'Select the data you want to delete'},
            '你确定要删除数据吗？': {CN: '你确定要删除数据吗？', EN: 'Are you sure you want to delete the data?'},
            '关联的流程定义': {CN: '关联的流程定义', EN: 'Associated process definition'},
            '历史版本': {CN: '历史版本', EN: 'Historical edition'},
            '请输入接口名称': {CN: '请输入接口名称', EN: 'Please enter the interface name'},
            '接口设计': {CN: '接口设计', EN: 'Interface design'},
            '更改处理人': {CN: '更改处理人', EN: 'Change handler'},
            '暂停': {CN: '暂停', EN: 'Hang'},
            '取消暂停': {CN: '取消暂停', EN: 'Cancel suspension'},
            '处理': {CN: '处理', EN: 'Approval'},
            '委派': {CN: '委派', EN: 'Delegate'},
            '修改处理人': {CN: '修改处理人', EN: 'Modification handler'},
            '暂无流程模板': {CN: '暂无流程模板', EN: 'No process template is available'},
            '请输入流程编码、流程名称': {
                CN: '请输入流程编码、流程名称',
                EN: 'Please enter the process code and process name'
            },
            '流程暂停成功': {CN: '流程暂停成功', EN: 'Process pause succeeded'},
            '流程暂停失败': {CN: '流程暂停失败', EN: 'Process pause failure'},
            '流程激活成功': {CN: '流程激活成功', EN: 'Process activation succeeded'},
            '流程激活失败': {CN: '流程激活失败', EN: 'Process activation failure'},
            '知会任务无需处理': {CN: '知会任务无需处理', EN: 'Notify that the task does not need to be handled'},
            '询问我的任务不能被委派': {CN: '询问我的任务不能被委派', EN: "The task of asking me can't be delegated"},
            '查看任务': {CN: '查看任务', EN: 'View task'},
            '终止成功': {CN: '终止成功', EN: 'Termination successfully'},
            '终止失败': {CN: '终止失败', EN: 'Termination failure'},
            '更改处理人失败': {CN: '更改处理人失败', EN: 'Failed to change handler'},
            '更改处理人成功': {CN: '更改处理人成功', EN: 'The change handler succeeded'},
            'FlowChart': {CN: '流程图', EN: 'Flow chart'},
            'FlowDiagram': {CN: '流程图解', EN: 'Flow diagram'},
            '历史流程': {CN: '历史流程', EN: 'History task'},
            '请输入流程编码，流程名称': {CN: '请输入流程编码，流程名称', EN: 'Please enter process code, process name'},
            'importInterface': {CN: '导入接口', EN: 'Import interface'},
            exporting: {
                CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
                EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">workbench > Operation Record</a> page.'
            },
            '流程设计': { CN: '流程设计', EN: 'Design Process' },
        }

    return {
        i18n: languageObj
    }
})
