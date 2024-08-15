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
          '菜单管理' : {CN : '菜单管理' , EN : 'Menu management'},
          '菜单最多配置到三级' : {CN : '菜单最多配置到三级' , EN : 'The menu can be configured to three levels at most'},
          '创建一级菜单' : {CN : '创建一级菜单' , EN : 'Create a first level menu'},
          '创建菜单' : {CN : '创建菜单' , EN : 'Create menu'},
          '编辑菜单' : {CN : '编辑菜单' , EN : 'Update menu'},
          '查看菜单' : {CN : '查看菜单' , EN : 'Look menu'},
          '配置菜单权限' : {CN : '配置菜单权限' , EN : 'update menu limit'},
          '名称' : {CN : '名称' , EN : 'Name'},
          '编码' : {CN : '编码' , EN : 'Code'},
          '排序' : {CN : '排序' , EN : 'Index'},
          '链接' : {CN : '链接' , EN : 'Href'},
          '图标' : {CN : '图标' , EN : 'Icon'},
          '是否显示' : {CN : '是否显示' , EN : 'IsShow'},
          '所属应用' : {CN : '所属应用' , EN : 'AppName'},
          '操作' : {CN : '操作' , EN : 'Operation'},
          '是' : {CN : '是' , EN : 'Yes'},
          '否' : {CN : '否' , EN : 'No'},
          'number_required_msg' : {CN : '请填写编码' , EN : 'Please fill in the code'},
          'munber_max_msg' : {CN : '编码最大不能超过100个字符' , EN : 'The maximum encoding cannot exceed 100 characters'},
          '选择图标' : {CN : '选择图标' , EN : 'Select icon'},
          '展示方式' : {CN : '展示方式' , EN : 'Display method'},
          'IconTips' : {CN : '图标大小16px X 16px' , EN : 'Icon size 16px X 16px'},
          '菜单新增成功' : {CN:'菜单新增成功',EN:'Menu added successfully'},
          '删除菜单成功' : {CN:'删除菜单成功',EN:'Menu deleted successfully'},
          '确认删除' :  {CN : '确认删除' , EN : 'Confirm deletion'},
          '确认移除' :  {CN : '确认移除' , EN : 'Confirm deletion'},
          '菜单' : {CN : '菜单' , EN : 'Menu'},
          '菜单更新成功' : {CN : '菜单更新成功' , EN : 'Menu updated successfully'},
          '基本信息' : {CN : '基本信息' , EN : 'Essential information'},
          '菜单权限' : {CN : '菜单权限' , EN : 'Menu permissions'},
          'addPermissions' : {CN : '批量增加权限' , EN : 'Batch Add Permissions'},
          '当前菜单权限' : {CN : '当前菜单权限' , EN : 'Current menu permission'},
          '新增菜单失败' : {CN : '新增菜单失败' , EN : 'Failed to add menu'},
          '更新菜单失败' : {CN : '更新菜单失败' , EN : 'Failed to update menu'},
          '删除菜单失败' : {CN : '删除菜单失败' , EN : 'Failed to delete menu'},
          '参与者类型' : {CN : '参与者类型' , EN : 'Participant Type'},
          '参与者' : {CN : '参与者' , EN : 'Participant'},
          '部门' : {CN : '部门' , EN : 'Department'},
          '电话' : {CN : '电话' , EN : 'Telephone'},
          '邮箱' : {CN : '邮箱' , EN : 'Email'},
          '添加成员失败' : {CN : '添加成员失败' , EN : 'Failed to add member'},
          '成员添加成功' : {CN : '成员添加成功' , EN : 'Member added successfully'},
          '添加成员' : {CN : '添加成员' , EN : 'Add Members'},
          '创建子菜单' : {CN : '创建子菜单' , EN : 'Create submenu'},
          '编辑' : {CN : '编辑' , EN : 'Edit'},
          '删除' : {CN : '删除' , EN : 'Remove'},
          '移除' : {CN : '移除' , EN : 'Remove'},
          '移除成功' : {CN : '移除成功' , EN : 'Failed to remove people'},
          '已成功移除该人员' : {CN : '已成功移除该人员' , EN : 'The person has been successfully removed'},
          'errorSelect' : {CN : '请先选择人员数据' , EN : 'Please select personnel data first'},
          '关闭' : {CN : '关闭' , EN : 'Close'},
          '获取菜单数据失败' : {CN : '获取菜单数据失败' , EN : 'Failed to get menu data'},
          'iframe 弹框页面' : {CN : 'iframe 弹框页面' , EN : 'Iframe pop up page'},
          'iframe 嵌入页面' : {CN : 'iframe 嵌入页面' , EN : 'Iframe embedded page'},
          '新标签页面' : {CN : '新标签页面' , EN : 'New Tab Page'},
          '系统内置页面' : {CN : '系统内置页面' , EN : 'System built-in page'},
          '系统弹窗页面' : {CN : '系统弹窗页面' , EN : 'System pop-up page'},
          '一级菜单抽屉' : {CN : '一级菜单抽屉' , EN : 'Primary menu drawer'},
          '确定' : {CN : '确定' , EN : 'Confirm'},
          '取消' : {CN : '取消' , EN : 'Cancel'},
          '菜单名称': {CN : '菜单名称' , EN : 'Menu name'},
          'searchTips': {CN : '请输入名称/编码' , EN : 'Please enter Name/Code'},
          'new': {CN : '新增' , EN : 'new'},
          'article': {CN : '条' , EN : 'article'},

    }

    return {
        i18n : languageObj
    }
 })
