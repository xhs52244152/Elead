define([], function () {
    return {
        i18n: {
            'create': { CN: '创建', EN: 'Create' },
            'edit': { CN: '编辑', EN: 'Edit' },
            'undoEdit': { CN: '撤销编辑', EN: 'Undo Edit' },
            'save': { CN: '保存', EN: 'Save' },
            'saveAs': { CN: '另存为', EN: 'Save As' },
            'confirm': { CN: '确定', EN: 'Confirm' },
            'close': { CN: '关闭', EN: 'Close' },
            'saveDraft': { CN: '保存草稿', EN: 'Save Draft' },
            'tips': { CN: '提示', EN: 'Tips' },
            'closeTip': { CN: '确认关闭当前页面？', EN: 'Confirm to close the current page ?' },

            'reversionConfirm': { CN: '确认修订', EN: 'Confirm Revision' },
            'reversionTip': { CN: '确认修订该数据?', EN: 'Are you sure to revise this data?' },
            'selectReversionTip': { CN: '修订信息如下：', EN: 'The revised information is as follows:' },

            'delete': { CN: '删除', EN: 'Delete' },
            'deleteConfirm': { CN: '确认删除', EN: 'Confirmation Delete' },
            'deleteTip': { CN: '确认删除该数据', EN: 'Confirm to delete the current data' },
            'deleteBatchTip': { CN: '确认删除所选数据', EN: 'Confirm deletion of selected data' },
            'deleteSuccess': { CN: '删除成功', EN: 'Delete Success' },

            'selectTip': { CN: '请选择数据', EN: 'Please select data' },
            'pleaseSelect': { CN: '请您选择', EN: 'Please select' },
            'remove': { CN: '移除', EN: 'Remove' },
            'cancel': { CN: '取消', EN: 'Cancel' },
            'operate': { CN: '操作', EN: 'Operate' },
            'oldName': { CN: '原名称', EN: 'Old Name' },
            'rename': { CN: '重命名', EN: 'Rename' },
            'move': { CN: '移动', EN: 'Move' },
            'batchDownload': { CN: '批量下载文件', EN: 'Batch Download Files' },

            'deleteType1': { CN: '删除最大版本的最新小版本', EN: 'Remove the smallest version of the largest version' },
            'deleteType2': { CN: '删除最大版本', EN: 'Delete max version' },
            'deleteType3': { CN: '删除对象', EN: 'Delete object' },

            'createPart': { CN: '创建部件', EN: 'Create Part' },
            'editPart': { CN: '编辑部件', EN: 'Edit Part' },
            'partDetail': { CN: '部件详情', EN: 'Part Detail' },
            'createSuccess': { CN: '创建成功', EN: 'Created successfully' },
            'updateSuccess': { CN: '更新成功', EN: 'Update successfully' },

            'cancelEdit': {
                CN: '如果撤销编辑，您会失去对该对象所作的更改。是否要撤销编辑？',
                EN: 'If you cancel the edit, you will lose the changes made to this object. Do you want to cancel the edit?'
            },

            'pleaseSelectType': { CN: '请选择类型', EN: 'Please select type' },
            'cancelEditTip': {
                CN: '是否撤销编辑?',
                EN: 'Do you want to cancel the edit?'
            },

            'refuseReason': { CN: '拒绝原因', EN: 'Refuse reason' },
            'operateSuccess': { CN: '操作成功', EN: 'Operate Success' },
            'creator': { CN: '创建者', EN: 'Creator' },
            'createTime': { CN: '创建时间', EN: 'Create Time' },
            'updateBy': { CN: '修改者', EN: 'Modified by' },
            'updateTime': { CN: '修改时间', EN: 'Update Time' },
            'version': { CN: '版本', EN: 'Version' },
            'revisedVersion': { CN: '修订后的版本', EN: 'Revised version' },
            'currentState': { CN: '当前生命周期状态', EN: 'Current Lifecyle State' },
            'lifecyleState': { CN: '生命周期状态', EN: 'Lifecyle State' },
            'partName': { CN: '部件名称', EN: 'Part Name' },
            'identifierNo': { CN: '编码', EN: 'Identifier No' },
            'view': { CN: '视图', EN: 'View' },
            'number': { CN: '编码', EN: 'No' },
            'code': { CN: '编码', EN: 'code' },
            'folder': { CN: '文件夹', EN: 'Folder' },
            'context': { CN: '上下文', EN: 'Context' },
            'name': { CN: '名称', EN: 'Name' },
            'type': { CN: '类型', EN: 'Type' },
            'classify': { CN: '分类', EN: 'Classify' },
            'property': { CN: '属性', EN: 'Property' },
            'structure': { CN: '结构', EN: 'Structure' },
            'relationObj': { CN: '相关对象', EN: 'Relationship Object' },
            'team': { CN: '团队', EN: 'Team' },
            'change': { CN: '变更', EN: 'Change' },
            'history': { CN: '历史记录', EN: 'History' },
            'replace': { CN: '替换管理', EN: 'Replace Management' },
            'bomView': { CN: 'BOM视图', EN: 'BOM View' },
            'processInfo': { CN: '流程信息', EN: 'Process Info' },
            'used': { CN: '被使用', EN: 'Used' },
            'checkinRemark': { CN: '检入备注', EN: 'Checkin Remark' },
            'editBy': { CN: '已被 {name} 编辑', EN: 'is edit by {name}' },
            'you': { CN: '您', EN: 'you' },
            'toLatestVersion': { CN: '转至最新版本', EN: 'Go to the latest version' },

            'desDoc': { CN: '描述文档', EN: 'Description Document' },
            'cadModel': { CN: 'CAD模型', EN: 'CAD Model' },
            'reference': { CN: '参考文档', EN: 'Reference' },
            'supplier': { CN: '供应商文档', EN: 'Supplier' },

            'updateOwner': {
                CN: '更改所有者',
                EN: 'Update Owner'
            },
            'createRelProc': { CN: '创建发布流程', EN: 'Create Release Process' },
            'reassignLifecycle': { CN: '重新分配生命周期', EN: 'Reassign Lifecycle' },
            'syncComponent': { CN: '同步元器件', EN: 'Synchronous Component' },
            'revise': { CN: '修订', EN: 'Revise' },
            'setState': { CN: '设置状态', EN: 'Set State' },
            'initChange': { CN: '发起变更', EN: 'Initiate Changes' },
            'originalOwner': {
                CN: '原所有者',
                EN: 'Original owner'
            },
            'changeOwner': { CN: '更改所有者', EN: 'Change Owner' },
            'typeInfo': { CN: '类型信息', EN: 'Type Info' },
            'baseInfo': { CN: '基本信息', EN: 'Base Info' },
            'extendedAttributes': { CN: '扩展属性', EN: 'Extended Attributes' },
            'attach': { CN: '附件', EN: 'Attach' },
            'collectObjs': { CN: '收集相关对象', EN: 'Collect related objects' },
            'collectParts': { CN: '收集部件', EN: 'Collect Parts' },
            'collectDoc': { CN: '收集文档', EN: 'Collect Documentation' },
            'collectModel': { CN: '收集模型', EN: 'Collect Model' },
            'collectStructure': { CN: '收集结构', EN: 'collect Structure' },
            'collectViewVersion': { CN: '收集视图版本', EN: 'Collect View Version' },
            'export': { CN: '导出', EN: 'Export' },
            'infoCompareTitle': { CN: '信息比较', EN: 'Information comparison' },
            'checkTwoPieces': { CN: '请至少勾选两条数据', EN: 'Please check at least two pieces of data' },
            'upToTen': { CN: '一次最多勾选10条数据', EN: 'Check up to 10 data items at a time' },
            'addToWorkspace': { CN: '添加至工作区', EN: 'Add to workspace' },
            'selectOneDataTips': { CN: '请至少选择一条数据', EN: 'Please select at least one piece of data' },
            'selectMoreDataTips': { CN: '最多选择两条数据', EN: 'Select up to two pieces of data' },

            '请前往“工作台>我的导入导出”查看失败原因': {
                CN: '请前往“工作台>我的导入导出”查看失败原因',
                EN: 'Choose Workbench > My Import/Export to check the failure cause'
            },
            '前往我的导入导出': { CN: '前往我的导入导出', EN: 'Go to My Import/Export' }
        }
    };
});