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
          '请输入': { CN: '请输入', EN: 'Place Enter' },
          '删除' : {CN : '删除' , EN : 'Delete'},
          '编辑' : {CN : '编辑' , EN : 'Edit'},
          '添加' : {CN : '添加' , EN : 'Create'},
          '新增' : {CN : '新增' , EN : 'Add'},
          '详情' : {CN : '详情' , EN : 'Detail'},
          '删除成功' : {CN : '删除成功' , EN : 'Deleted successfully'},
          '删除失败' : {CN : '删除失败' , EN : 'Delete failed'},
          '操作': { CN: '操作', EN: 'operation' },
          '名称': { CN: '名称', EN: 'Name' },
          '编码': { CN: '编码', EN: 'code' },
          '已启用': { CN: '已启用', EN: 'Enabled' },
          '上下文': { CN: '上下文', EN: 'Context' },
          '创建时间': { CN: '创建时间', EN: 'Create time' },
          '创建人': { CN: '创建人', EN: 'Founder' },
          '最后修改时间': { CN: '最后修改时间', EN: 'The last modification time' },
          '最后修改人': { CN: '最后修改人', EN: 'The final modifier' },
          '启用成功': { CN: '启用成功', EN: 'Enable successful' },
          '关闭成功': { CN: '关闭成功', EN: 'Disabled successful' },
          '启用失败': { CN: '启用失败', EN: 'Enable failure' },

    }

    return {
        i18n : languageObj
    }
 })