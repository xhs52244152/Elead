**高级表格，基础表格列（colomn）的格式**
[{
    prop: 'checkbox',// 列数据字段key
    type: 'checkbox',// 特定类型 复选框[checkbox] 单选框[radio]
    minWidth: '60',// 列宽度
    width: '60',
    fixed: '',// 是否固定列
},
{
    prop: 'radio',// 列数据字段key
    type: 'radio',// 特定类型 复选框[checkbox] 单选框[radio]
    minWidth: '60',// 列宽度
    width: '60',
    fixed: '',// 是否固定列
},
{
    prop: 'name',// 列数据字段key
    title: 'Name',// 列头部标题
    minWidth: '60',// 列宽度
    width: '200',
    sort: true,// 是否需要排序 
    fixed: '',// 是否固定列
    // 筛选属性 有当前属性对应字段头部会自动添加筛选图标
    filter: {
        type: 'filterInput',//  筛选类型 默认只提供4中 搜索[filterInput] 多选[filterCheckbox] 单选[filterSelect] 选择器+输入框[filterMergeSelect]
        value: '',// 筛选器选择的值 自定义筛选的可忽略
        submit: this.filterMethod// 筛选控件回调事件 自定义筛选的可忽略
    },
    tips: '这是一个提示',// 表头提示信息
    treeNode: true,// 标记树形表格的位置
},
{
    prop: 'age',// 列数据字段key
    title: 'Age',// 列头部标题
    minWidth: '60',// 列宽度
    width: '200',
    sort: true,// 是否需要排序
    fixed: '',
    // 筛选属性 有当前属性对应字段头部会自动添加筛选图标
    filter: {
        //  筛选类型 默认只提供4中 搜索[filterInput] 多选[filterCheckbox] 单选[filterSelect] 选择器+输入框[filterMergeSelect]
        type: 'filterCheckbox',
        // filterCheckbox勾选数据 必传
        options: [
            { id: 1, name: '上海' },
            { id: 2, name: '北京' },
            { id: 3, name: '广州' },
            { id: 4, name: '深圳' },
            { id: 5, name: '天津' },
            { id: 6, name: '福建' },
            { id: 7, name: '厦门' },
            { id: 8, name: '江西' },
            { id: 9, name: '哈尔滨' },
            { id: 10, name: '云南' }
        ],
        value: [],// 筛选器选择的值 自定义筛选的可忽略
        submit: this.filterMethod// 筛选控件回调事件 自定义筛选的可忽略
    }
},
{
    prop: 'sex',// 列数据字段key
    title: 'Sex',// 列头部标题
    minWidth: '60',// 列宽度
    width: '120',
    sort: false,// 是否需要排序
    fixed: '',
    // 筛选属性 有当前属性对应字段头部会自动添加筛选图标
    filter: {
        //  筛选类型 默认只提供4中 搜索[filterInput] 多选[filterCheckbox] 单选[filterSelect] 选择器+输入框[filterMergeSelect]
        type: 'filterSelect',
        // filterSelect需要选择的数据 必传
        options: [
            { id: 1, name: '上海' },
            { id: 2, name: '北京' },
            { id: 3, name: '广州' },
            { id: 4, name: '深圳' },
            { id: 5, name: '天津' },
            { id: 6, name: '福建' },
            { id: 7, name: '厦门' },
            { id: 8, name: '江西' },
            { id: 9, name: '哈尔滨' },
            { id: 10, name: '云南' }
        ],
        value: '',// 筛选器选择的值 自定义筛选的可忽略
        submit: this.filterMethod// 筛选控件回调事件 自定义筛选的可忽略
    }
},
{
    prop: 'role',// 列数据字段key
    title: 'Role',// 列头部标题
    minWidth: '60',// 列宽度
    width: '120',
    sort: false,// 是否需要排序
    fixed: '',
    // 筛选属性 有当前属性对应字段头部会自动添加筛选图标
    filter: {
        //  筛选类型 默认只提供4中 搜索[filterInput] 多选[filterCheckbox] 单选[filterSelect] 选择器+输入框[filterMergeSelect]
        type: 'filterMergeSelect',
        // filterMergeSelect 选择器+输入框 必传
        options: [
            { id: 1, name: '小于' },
            { id: 2, name: '大于' },
            { id: 3, name: '等于' }
        ],
        value: '',// 输入框的值
        selectVal: '等于',// 选择框值
        submit: this.filterMethod// 筛选控件回调事件 自定义筛选的可忽略
    }
},
{
    prop: 'address',// 列数据字段key
    title: 'Address',// 列头部标题
    minWidth: '60',// 列宽度
    width: '120',
    sort: false,// 是否需要排序
    fixed: '',
    // 自定义筛选 模板添加 slot= #column:filter:prop
    filter: {
        // 自定义类型
        type: 'custom',
        value: ''
    }
},
{
    prop: 'operation',// 列数据字段key
    title: '操作',// 列头部标题
    minWidth: '60',// 列宽度
    width: '',
    sort: false,// 是否需要排序
    fixed: 'right'
}]