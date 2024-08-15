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
    const languageObj =  {
          '全部' : {CN : '全部' , EN : 'All'},
          '模型属性' : {CN : '模型属性' , EN : 'Model Properties'},
          '标准属性' : {CN : '标准属性' , EN : 'Standard Properties'},
          '软属性' : {CN : '软属性' , EN : 'Soft Attribute'},
          '删除' : {CN : '删除' , EN : 'Delete'},
          '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
          '确认': { CN: '确认', EN: 'Confirm' },
          '取消': { CN: '取消', EN: 'Cancel' },
          '删除成功': { CN: '删除成功', EN: 'Successfully Delete' },
          '删除失败': { CN: '删除失败', EN: 'Delete Failed' },
          '编辑' : {CN : '编辑' , EN : 'Edit'},
          '操作': { CN: '操作', EN: 'Operation' },
          '创建': { CN: '创建', EN: 'Create' },
          '内部名称': { CN: '内部名称', EN: 'Internal name' },
          '显示名称': { CN: '显示名称', EN: 'Show Name' },
          '所属类型': { CN: '所属类型', EN: 'Belong Type' },
          '所属分类': { CN: '所属分类', EN: 'Belong Classification' },
          '数据类型': { CN: '数据类型', EN: 'Type Data' },
          '属性分类': { CN: '属性分类', EN: 'Attribute Classification' },
          '详情': { CN: '详情', EN: 'Detail' },
          '创建属性': { CN: '创建属性', EN: 'Create Attribute' },
          '编辑属性': { CN: '编辑属性', EN: 'Edit Attribute' },
          '属性权限配置': { CN: '属性权限配置', EN: 'Attribute Permission Configuration' },
          '权限': { CN: '权限', EN: 'Permission' },
          'export': { CN: '导出', EN: 'Export' },
          'nonCurrentTenant': { CN: '非当前租户数据禁止操作', EN: 'Non-current tenant data cannot be performed' },
          '继承属性': { CN: '继承属性', EN: 'Inherited attribute' },
          '自定义属性': { CN: '自定义属性', EN: 'Custom attribute' },
          '全局属性': { CN: '全局属性', EN: 'Global attribute' },
    }

    return {
        i18n : languageObj
    }
 })
