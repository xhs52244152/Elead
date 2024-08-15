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
          '基本信息' : {CN : '基本信息' , EN : 'Basic information'},
          '内部名称' : {CN : '内部名称' , EN : 'Internal name'},
          '名称' : {CN : '名称' , EN : 'Name'},
          '描述' : {CN : '描述' , EN : 'Description'},
          '是否启用' : {CN : '是否启用' , EN : 'Enable'},
          '是' : {CN : '是' , EN : 'Yes'},
          '否' : {CN : '否' , EN : 'No'},
          '确定' : {CN : '确定' , EN : 'Confirm'},
          '取消' : {CN : '取消' , EN : 'Cancel'},
          '编辑' : {CN : '编辑' , EN : 'Edit'},
          '获取表单详情失败' : {CN : '获取表单详情失败' , EN : 'Failed to get the form for details'},
          '更新成功' : {CN : '更新成功' , EN : 'update successfully'},
          '新增成功' : {CN : '新增成功' , EN : 'create successfully'},
          '更新失败' : {CN : '更新失败' , EN : 'update failed'},
          '新增失败' : {CN : '新增失败' , EN : 'create failed'},
          '是否放弃保存' : {CN : '是否放弃保存' , EN : 'Whether to give up keep'},
          '确认取消' : {CN : '确认取消' , EN : 'Confirm to cancel'},
          '编辑组件' : {CN : '编辑组件' , EN : 'Edit component'},
          '请输入内部名称': { CN: '请输入内部名称', EN: 'Please enter the internal name' },
          '内部名称格式错误': { CN: '内部名称格式错误：请输入大小写字母、"_"、"."', EN: 'The internal name format error: please enter the lowercase letters, "_" and "."' },
    }

    return {
        i18n : languageObj
    }
 })