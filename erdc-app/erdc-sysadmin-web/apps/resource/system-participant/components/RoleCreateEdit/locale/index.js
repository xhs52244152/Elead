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
          '编码' : {CN : '编码' , EN : 'Number'},
          '排序' : {CN : '排序' , EN : 'Sort order'},
          '名称' : {CN : '名称' , EN : 'Name'},
          '温馨提示' : {CN : '温馨提示', EN : 'Reminder'},
          'longTxt' : {CN : '这是一个长文本 XXX' , EN : 'This is a long text XXX'},
          '请输入' : {CN : '请输入' , EN : 'Please Enter'},
          '请点击' : {CN : '请点击' , EN : 'Please click'},
          '编辑' : {CN : '编 辑' , EN : 'Edit'},
          '确定' : {CN : '确 定' , EN : 'Confirm'},
          '取消' : {CN : '取 消' , EN : 'Cancel'},
          '更新成功': { CN: '更新成功', EN: 'Update successful' },
          '新增成功': { CN: '新增成功', EN: 'Create successful' },
          '更新失败': { CN: '更新失败', EN: 'Update failed' },
          '新增失败': { CN: '新增失败', EN: 'Create failure' },
          '有效': { CN: '有效', EN: 'Effective' },
          '失效': { CN: '失效', EN: 'Invalid' },
          '编辑角色': { CN: '编辑角色', EN: 'Edit role' },
          '是': { CN: '是', EN: 'Yes' },
          '否': { CN: '否', EN: 'No' },
          '是否启用': { CN: '是否启用', EN: 'Whether to enable' },
          '类型': { CN: '类型', EN: 'Type' },
          '描述': { CN: '描述', EN: 'Describe' },
          '是否不创建角色': { CN: '是否不创建角色', EN: 'Whether not create role' },
          '确认取消': { CN: '确认取消', EN: 'Confirm cancel' },
          '是否放弃编辑': { CN: '是否放弃编辑', EN: 'Whether to give up the editor' },
          '请输入编码': { CN: '请输入编码', EN: 'Please enter the code' },
          '请输入大小写字母': { CN: '请输入大小写字母、"_"、"."', EN: 'Please enter the letters, "_" and "."' },
          
    }

    return {
        i18n : languageObj
    }
 })
