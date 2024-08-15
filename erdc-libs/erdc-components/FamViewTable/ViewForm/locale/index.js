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
        // 视图表单国际化
        视图名称: { CN: '视图名称', EN: 'View Name' },
        类型: { CN: '类型', EN: 'Type' },
        描述: { CN: '描述', EN: 'Description' },
        设置视图条件: { CN: '设置视图条件', EN: 'Set View Conditions' },
        添加筛选字段: { CN: '添加筛选字段', EN: 'Add Filter Field' },
        添加基础筛选字段: { CN: '+ 添加基础筛选字段', EN: '+ Add Basic Filter Field' },
        添加筛选字段提示: {
            CN: '添加字段展示下方，可拖动调整顺序，该顺序即当前视图的基础筛选条件展示顺序',
            EN: `Add fields below the display and drag to adjust the order, which is the display order of the current view's basic filtering conditions`
        },
        设置显示字段: { CN: '设置显示字段', EN: 'Set Display Fields' },
        请先选择类型: { CN: '请先选择类型', EN: 'Please select a type first' },
        无可配置筛选的字段: { CN: '无可配置筛选的字段', EN: 'No fields for filtering are configured' },
        是否分享: { CN: '是否分享', EN: 'Share' },
        全局分享: { CN: '全局分享', EN: 'Global Share' },
        上下文内分享: { CN: '上下文内分享', EN: 'Share in Context' },
        不分享: { CN: '不分享', EN: "Don't Share" },
        冻结列数: { CN: '冻结列数', EN: 'Frozen Columns' },
        已选条件请输入值: { CN: '已选条件请输入值', EN: 'Please enter a value for the selected condition' },
        从左到右冻结的列数: { CN: '从左到右冻结的列数', EN: 'The number of columns from left to right to freeze' },
        已添加条件请输入值: { CN: '已添加条件请输入值', EN: 'Conditions have been added Please enter a value' },
        选择条件字符超长: { CN: '选择条件字符超长', EN: 'Select condition characters that are too long' },
        基础筛选字段: { CN: '基础筛选字段', EN: 'Basic Filter Fields' },
        确定: { CN: '确定', EN: 'confirm' },
        取消: { CN: '取消', EN: 'cancel' },
        rightTipSort: {
            CN: '排序：如需要用该字段排序请选择“是”，支持正序/倒序',
            EN: 'Sort: if you need to sort with this field, please select "Yes" to support positive / reverse order.'
        },
        rightTipTip: {
            CN: 'Tips：如该字段在视图列头需要展示提示信息请选择是, tips的内容在模型属性中配置',
            EN: 'Tips: if this field needs to display a prompt in the view column header, please select Yes. The content of tips is configured in model properties '
        },
        rightTipDisplay: {
            CN: '显示：如该字段在视图创建后需默认显示请选择是，如仅做为可选字段请选择否',
            EN: 'Display: if the field needs to be displayed by default after the view is created, please select Yes, if only as an optional field, select No'
        },
        rightTipLock: {
            CN: '锁定：如该字段为视图的必选的关键字段可锁定，锁定字段用户自定义视图展示列时无法取消',
            EN: 'Locking: if this field is a required key field for the view, the locked field cannot be cancelled when the user customizes the view to display the column.'
        },
        setBasicFilter: { CN: '设置基础筛选字段', EN: 'Set Basic View filters' },
        listDisplayConfig: { CN: '列表展示配置', EN: 'List display configuration' },
        loadType: { CN: '数据加载方式', EN: 'Data Loading Mode' },
        dynamicLoad: { CN: '动态加载', EN: 'Dynamic Loading' },
        pageLoad: { CN: '分页', EN: 'pageLoad' },
        freezeColCount: { CN: '冻结列数', EN: 'Freeze Column Count' },
        leftToRight: { CN: '从左到右', EN: 'From left to right' },
        rightToLeft: { CN: '从右到左', EN: 'From right to left' },
        moreThan3Tip: {
            CN: '可配置链接地址的属性字段最多不能超过3个',
            EN: 'There can be no more than 3 property fields for configurable link addresses.'
        },
        deleteAll: { CN: '全部删除', EN: 'Delete all' },
        名称: { CN: '名称', EN: 'Name' },
        宽度: { CN: '宽度', EN: 'Width' },
        排序: { CN: '排序', EN: 'Index' },
        默认显示: { CN: '默认显示', EN: 'default display' },
        lock: { CN: '锁定', EN: 'Lock' },
        unlock: { CN: '解锁', EN: 'Unlock' },
        remove: { CN: '移除', EN: 'remove' },
        linkSwitchTip: {
            CN: '开启后，视图列表该字段可点击, "链接地址"未配置则使用代码配置项的链接点击事件',
            EN: 'After opening, this field in the view list can be clicked. If the "Link Address" is not configured, the link click event of the code configuration item will be used. '
        },
        href: { CN: '链接', EN: 'Href' },
        fieldLink: { CN: '字段链接', EN: 'Field link ' },
        linkAddress: { CN: '链接地址', EN: 'link address' },
        linkAddressTip: {
            CN: '请输入点击该字段跳转的链接地址，如果跳转的页面包含上下文参数，请配置参数',
            EN: 'Please enter the link address to which you click this field to jump. If the page you jump to contains context parameters, please configure the parameters '
        },
        linkTipPart1: { CN: '请输入点击该字段跳转的链接地址，如果跳转的页面包含上下文参数，请配置参数，场景说明：', EN: 'Please enter the link address to which you click this field to jump. If the page you jump to contains context parameters, please configure the parameters. Scenario description: ' },
        linkTipPart2: { CN: '例1: 打开对象列表页并查询出该条数据，即配置该对象的列表页的菜单地址，页面打开后会带上该对象实例的"oid"并过滤出该条数据。', EN: 'Example 1: Open the object list page and query the piece of data, that is, the menu address of the list page where the object is configured. After the page is opened, the "oid" of the object instance will be brought and the piece of data will be filtered out.' },
        linkTipPart3: { CN: '例2: 打开该对象实例的空间详情页，空间详情需拼接${pid},${oid},${title}等参数到链接地址上，参考示例：', EN: 'Example 2: Open the space details page of the object instance. Space details need to be spliced with parameters such as ${pid},${oid}, and ${title} to the link address. Refer to the example:  ' },
        linkTipPart4: { CN: '视图列表页: #${列表页菜单链接}', EN: 'View list page: #${list page menu link}' },
        linkTipPart5: { CN: '项目空间: #${项目空间菜单链接}?pid=${xxx}&title=${xxx}', EN: 'Project Space: #${Project Space Menu links}?pid=${xxx}&title=${xxx}' },
        linkTipPart6: { CN: '知识库: #${知识空间菜单链接}?oid=${xxx}&title=${xxx}', EN: 'Knowledge Base: #${Knowledge Space Menu links}?oid=${xxx}&title=${xxx} ' },
        linkTipPart7: { CN: '产品库: #${产品空间菜单链接}?pid=${xxx}', EN: 'Product Library: #${Product Space Menu links}?pid=${xxx} ' },
    };

    return {
        i18n: languageObj
    };
});
