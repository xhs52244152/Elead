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
          '创建' : {CN : '创建' , EN : 'Create'},
          '启用' : {CN : '启用' , EN : 'Enable'},
          '停用' : {CN : '停用' , EN : 'Disable'},
          '编辑' : {CN : '编辑' , EN : 'Edit'},
          '删除' : {CN : '删除' , EN : 'Delete'},
          '查看组件' : {CN : '查看组件' , EN : 'Check component'},
          '新增组件' : {CN : '新增组件' , EN : 'Add component'},
          '创建组件' : {CN : '创建组件' , EN : 'Create component'},
          '编辑组件' : {CN : '编辑组件' , EN : 'Edit Component'},
          '确认删除' : {CN : '确认删除' , EN : 'Confirm delete'},
          '是否要删除该组件' : {CN : '是否要删除该组件？' , EN : 'Whether you want to delete this component?'},
          '确定' : {CN : '确定' , EN : 'confirm'},
          '取消' : {CN : '取消' , EN : 'cancel'},
          '删除成功' : {CN : '删除成功' , EN : 'Delete successful'},
          '删除失败' : {CN : '删除失败' , EN : 'Delete failure'},
          '停用成功' : {CN : '停用成功' , EN : 'Stop successful'},
          '启用成功' : {CN : '启用成功' , EN : 'Enable successful'},
          '停用失败' : {CN : '停用失败' , EN : 'Stop failure'},
          '启用失败' : {CN : '启用失败' , EN : 'Enable failure'},
          '是否停用该组件' : {CN : '是否停用该组件' , EN : 'Whether to disable the component'},
          '是否启用该组件' : {CN : '是否启用该组件' , EN : 'Whether to enable the component'},
          '停用组件' : {CN : '停用组件' , EN : 'Disable components'},
          '启用组件' : {CN : '启用组件' , EN : 'Enable the component'},

          '组件名称' : {CN : '组件名称' , EN : 'Component name'},
          '显示名称' : {CN : '显示名称' , EN : 'Show Name'},
          '描述' : {CN : '描述' , EN : 'Description'},
          '状态' : {CN : '状态' , EN : 'State'},
          '操作' : {CN : '操作' , EN : 'Operation'},
    }

    return {
        i18n : languageObj
    }
 })