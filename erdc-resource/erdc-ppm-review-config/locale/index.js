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
        createSuccess: {
            CN: '创建成功',
            EN: 'create success'
        },
        editSuccess: {
            CN: '编辑成功',
            EN: 'edit success'
        },
        viewQualityObjectives: {
            CN: '查看质量目标',
            EN: 'View quality objectives'
        },
        createQualityObjectives: {
            CN: '创建质量目标',
            EN: 'Create quality objectives'
        },
        editingQualityObjectives: {
            CN: '编辑质量目标',
            EN: 'Editing quality objectives'
        },
        editingReviewPoints: {
            CN: '编辑评审点',
            EN: 'Editing review points'
        },
        createReviewPoints: {
            CN: '创建评审点',
            EN: 'create review points'
        },
        createReviewType: {
            CN: '创建评审类型',
            EN: 'create Review Type'
        },
        editReviewType: {
            CN: '编辑评审类型',
            EN: 'Edit Review Type'
        },
        addReviewElements: {
            CN: '增加评审要素',
            EN: 'Add review elements'
        },
        viewDeliverables: {
            CN: '查看交付件',
            EN: 'View Deliverables'
        },
        createViewDeliverables: {
            CN: '创建交付件',
            EN: 'Create View Deliverables'
        },
        editViewDeliverables: {
            CN: '编辑交付件',
            EN: 'Edit View Deliverables'
        },
        createChildNodes: {
            CN: '创建子节点',
            EN: 'Create child nodes'
        },
        createPeerNodes: {
            CN: '创建同级节点',
            EN: 'Create peer nodes'
        },

        viewReviewElements: {
            CN: '查看评审要素',
            EN: 'View Review Elements'
        },
        confirmMoveTip: {
            CN: '确认移动该数据？',
            EN: 'Confirm move of this data?'
        },
        confirmMove: {
            CN: '确认移动',
            EN: 'confirm move'
        },
        batchSetCropping: {
            CN: '批量设置裁剪',
            EN: 'Batch Set Cropping'
        },
        deleteWork: {
            CN: '删除工作项会同步删除子工作项',
            EN: 'Deleting work items will synchronize the deletion of sub work items'
        },
        deleteTip: {
            CN: '确认删除',
            EN: 'confirm delete'
        },
        configTitle: {
            CN: '评审配置',
            EN: 'Review config'
        },
        moveTip: {
            CN: '提示：移动工作项会同步移动子工作项和已应用的实例',
            EN: 'Tip: Moving work items will synchronize the movement of sub work items and applied instances'
        },
        confirmInvali: {
            CN: '确认失效',
            EN: 'Confirm invalidation'
        },
        confirmvali: {
            CN: '确认生效',
            EN: 'Confirm validation'
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
        confirmValidation: {
            CN: '确认生效该数据？',
            EN: 'Confirm validation of this data?'
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
            CN: '请选择数据',
            EN: 'Please select the data'
        },
        pleaseSelectAddData: {
            CN: '请选择要增加的数据',
            EN: 'Please select the data to add'
        },
        add: {
            CN: '增加',
            EN: 'Add'
        },
        addSuccess: {
            CN: '添加成功',
            EN: 'Add success'
        },
        remove: {
            CN: '移除',
            EN: 'remove'
        },
        confirmRemove: {
            CN: '确认移除',
            EN: 'Confirm Remove'
        },
        removeSuccess: {
            CN: '移除成功',
            EN: 'Remove success'
        },
        IsRemove: {
            CN: '是否移除?',
            EN: 'Isww remove ?'
        }
    };

    return { i18n: languageObj };
});
