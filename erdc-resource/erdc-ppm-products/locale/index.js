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
        draftSuccess: {
            CN: '草稿创建成功',
            EN: 'Draft created successfully'
        },
        createdSuccessfully: {
            CN: '创建成功',
            EN: 'Created successfully'
        },
        editSuccessfully: {
            CN: '编辑成功',
            EN: 'Edit successfully'
        },
        editProduct: {
            CN: '编辑产品',
            EN: 'Edit Product'
        },
        createProduct: {
            CN: '创建产品',
            EN: 'Create Product'
        },
        productName: {
            CN: '产品名称',
            EN: 'Product name'
        },
        selectTeam: {
            CN: '选择团队',
            EN: 'select Team'
        },
        position: {
            CN: '位置',
            EN: 'position'
        },
        name: {
            CN: '名称',
            EN: 'name'
        },

        deleteWork: {
            CN: '删除工作项会同步删除子工作项',
            EN: 'Deleting work items will synchronize the deletion of sub work items'
        },
        deleteTip: {
            CN: '确认删除',
            EN: 'confirm delete'
        },
        productInfo: {
            CN: '产品信息',
            EN: 'Product Info'
        },
        moveTip: {
            CN: '提示：移动工作项会同步移动子工作项和已应用的实例',
            EN: 'Tip: Moving work items will synchronize the movement of sub work items and applied instances'
        },
        confirmInvali: {
            CN: '确认失效',
            EN: 'Confirm invalidation'
        },
        confirmPublish: {
            CN: '确认发布',
            EN: 'Confirm publish'
        },
        invalidWorkTip: {
            CN: '失效工作项会同步失效子工作项',
            EN: 'Invalid work items will synchronize with invalid child work items'
        },
        publishWorkTip: {
            CN: '发布工作项会同步发布子工作项',
            EN: 'Publishing work items will synchronize publishing sub work items'
        },

        pleaseSelectMoveData: {
            CN: '请选择移动位置',
            EN: 'please select move data'
        },
        addAssociatedTeams: {
            CN: '增加关联团队',
            EN: 'Add associated teams'
        },
        addAssociatedReplaceTeams: {
            CN: '新增关联团队会替换已关联的团队',
            EN: 'Adding an associated team will replace the already associated team'
        },
        moveTo: {
            CN: '移动到',
            EN: 'move to'
        },
        confirmDelete: {
            CN: '确认删除该数据？',
            EN: 'Are you sure to delete this data?'
        },
        confirmInvalidation: {
            CN: '确认失效该数据？',
            EN: 'Confirm invalidation of this data?'
        },
        confirmPublishData: {
            CN: '确认发布该数据？',
            EN: 'Confirm publish of this data?'
        },
        searchTips: {
            CN: '请输入',
            EN: 'Please input'
        },
        pleaseSelectData: {
            CN: '请选择要移除的数据',
            EN: 'Please select the data to remove'
        },
        associate: {
            CN: '关联',
            EN: 'Associate'
        },
        remove: {
            CN: '移除',
            EN: 'remove'
        }
    };

    return { i18n: languageObj };
});
