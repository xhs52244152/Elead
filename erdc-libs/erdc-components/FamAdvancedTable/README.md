# 高级表格组件使用方式

# 1、HTML代码

> ```html
> <fam-advanced-table 
>  ref="FamAdvancedTable" 
>  :view-table-config="viewTableConfig"
>  :table-max-height="tableMaxHeight"
>  :table-height="tableHeight"
>  @table-data="fnTableData"
>  @callback="callback"
>  @handler-data="fnHandlerTableData"
>  >
> 	<template #left:toolbar:first>
> 		<erd-button>头部追加</erd-button>
> 	</template>
> 	<template #left:toolbar:end>
> 		<erd-button>尾部追加</erd-button>
> 	</template>
> 	<template #right:toolbar:first>
> 		<erd-button>头部追加</erd-button>
> 	</template>
> 	<template #right:toolbar:end>
> 		<erd-button>尾部追加</erd-button>
> 	</template>
> 	<template #column:default:operation:content="{ scope }">
> 		<erd-button type="text" @click="operationBtn(scope)">催办</erd-button>
> 		<erd-button type="text" @click="operationBtn(scope)">终止</erd-button>
> 		<erd-button type="text" @click="editRow(scope)" v-if="scope.row.editStatus == 0">编辑</erd-button>
> 		<erd-button type="text" @click="cancelEditRow(scope)" v-if="scope.row.editStatus != 0">取消</erd-button>
> 	</template>
> 	<template #column:header:name:content="{ scope }">
> 		<span>名字</span>
> 	</template>
> 	<template #column:filter:address:content="{ scope }">
> 		<div class="red" style="color:red;text-align:center;margin-bottom: 5px;">自定义</div>
> 		<erd-input clearable v-model="scope.filter.value" placeholder="请输入"></erd-input>
> 		<div class="filterBtn">
> 			<erd-button type="primary" size="mini"> 确认</erd-button>
> 			<erd-button class="cancel" size="mini"> 取消</erd-button>
> 		</div>
> 	</template>
> 	<!--编辑示例 切换name字段--> 
> 	<template  #column:default:name:content="{scope}">
> 		<!--初始状态--> 
> 		<span v-if="scope.row.editStatus==0 || !scope.row.editStatus">{{scope.row.name}}</span>
> 		<!--编辑-->
> 		<template v-if="scope.row.editStatus==1">
> 			<!--编辑查看状态-->
> 			<span v-if="!scope.row.clickStatus['name']" @click="toEdit(scope,'name')" class="edit-default">{{scope.row.name}}</span>
> 			<!--编辑状态-->
> 			<erd-input v-else clearable v-model="scope.row['editNameVal']" placeholder="请输入"></erd-input>
> 		</template>
> 	</template>
> </fam-advanced-table>
> ```

# 2、js配置代码

```javascript
new Vue({
            el: '#fam-demo',
            data() {
                return {
                    tableMaxHeight: 450, // 表格高度  
                    tableHeight: 450, // 表格高度  
                    viewTableConfig: {
                        main: 'viewRender',                             // 主标识，如果是视图渲染（viewRender），表格拿到viewOid才会进行调用接口渲染，否则不做任何处理，避免报错
                        dataKey: 'data.tableViewVos',                   // 数据源key，支持多层级  
                        viewOid: '',                                    // 视图id  
                        tableRequestConfig: {                           // 更多配置参考axios官网  
                            url: '/fam/view/table/page',               // 表格数据接口  
                            params: {},                                 // 路径参数  
                            method: 'post',                             // 请求方法（默认get）  
                        isFormData: false,				// 是否表单数据查询，如果是表单，则表格内不做任何参数处理，全部要外部表单传入内部无法处理
  
                            transformResponse: [function (data) {       // `transformResponse` 在传递给 then/catch 前，允许修改响应数据  
                                // 对接收的 data 进行任意转换处理  
                                let resData = data
                                try {
                                    resData = data && JSON.parse(data)
                                    
                                } catch (err) {
                                    
                                }
                                return resData;
                            }],
                        },
                        isDeserialize: true,                           // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）  
                        firstLoad: true,                                // 首次进入就加载数据（在钩子里面执行）  
                        toolbarConfig: {                                // 工具栏  
                            requestConfig: {
                                url: '/fam/view/getSearchFields',      // 查询高级搜索条件显示列的接口  
                                params: {},                             // 路径参数  
                                method: 'post',                         // 请求方法（默认get）  
                            },
                            showConfigCol: true,                        // 是否显示配置列，默认显示  
                            showMoreSearch: true,                       // 是否显示高级搜索，默认显示
                        showRefresh: false,				// 是否显示刷新表格，默认显示
                            fuzzySearch: {
                                show: true,                             // 是否显示普通模糊搜索，默认显示
                                placeholder: '请输入关键词搜索',         // 输入框提示文字，默认请输入
                                clearable: false,
                                isLocalSearch: false,                   //是否开启本地搜索，默认否
                                searchCondition: []                     //本地搜索匹配条件，默认全部字段
                            },
                            mainBtn: {                                  // 主要操作按钮
                                label: '新增',
                                class: '',
                                icon: '',
                                onclick: () => {
                                    
                                }
                            },
                            secondaryBtn: [
                                {
                                    type: 'default',
                                    class: '',
                                    icon: '',
                                    label: '加入'
                                },
                                {
                                    type: 'default',
                                    class: '',
                                    icon: '',
                                    label: '移出'
                                }
                            ],                                         // 次要操作按钮
                            moreOperateList: [                         // 更多操作按钮配置
                                {
                                    label: '批量导入',
                                    class: '',
                                    icon: '',
                                    disable: false,
                                    onclick: () => {
                                        
                                    }
                                },
                                {
                                    label: '批量导出',
                                    class: '',
                                    icon: '',
                                    disable: false,
                                    onclick: () => {
                                        
                                    }
                                },
                                {
                                    label: '批量移动',
                                    class: '',
                                    icon: '',
                                    disable: false,
                                    onclick: () => {
                                        
                                    }
                                },
                                {
                                    label: '批量删除',
                                    class: '',
                                    icon: '',
                                    disable: false,
                                    onclick: () => {
                                        
                                    }
                                }
                            ]
                        },
                        headerRequestConfig: {                          // 表格列头查询配置(默认url: '/fam/table/head')，如果没配置接口请求，则需要配置columns
                            method: 'POST',
                            data: {                                     // 参数（不是固定，按自己需求来）
                                "className": this.$store.getters.className('tableDefinition')
                            }
                        },
                        sortFixRight: true,                             // 排序图标是否显示在右边
                        columnWidths: {                                 // 设置列宽，配置>接口返回>默认
                            'tableKey': '200px',
                            'nameI18nJson': '200px',
                            'operation': '130px'
                        },
                        addOperationCol: true,                          // 是否添加操作列（该列需要自己写插槽，prop固定operation）
                    addCheckbox: true,				// 是否添加复选框（勾选事件可参考vxe-table官网提供事件）
                    addRadio: true,					// 是否添加单选框（勾选事件可参考vxe-table官网提供事件）
                    addSeq: true,					// 是否添加序列
                        fieldLinkConfig: {
                            fieldLink: true,                                // 是否添加列超链接
                            // fieldLinkName: 'tableKey',                   // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {                             // 超链接事件
                                this.linkClick(row)
                            }
                        },
                        slotsField: [                                   // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            {
                                prop: 'name',                           // 字段名
                                type: 'header'                          // 头部文本插槽
                            },
                            {
                                prop: 'name',                           // 字段名
                                type: 'default'                         // 头部文本插槽
                            },
                            {
                                prop: 'operation',
                                type: 'default'                         // 显示字段内容插槽
                            },
                            {
                                prop: 'address',
                                type: 'filter'                          // 过滤(筛选)插槽
                            }
                        ],
                        tableBaseConfig: {                              // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                            rowConfig: {
                                isCurrent: true,
                                isHover: true
                            },
                            align: 'left',                              // 全局文本对齐方式
                            columnConfig: {
                                resizable: true,                        // 是否允许调整列宽
                            },
                            showOverflow: true,                         // 溢出隐藏显示省略号
                            treeConfig: {                               // 树配置
                                transform: true,
                                rowField: 'id',
                                parentField: 'pId',
                                treeNode: 'processDefinitionName',                       // 显示树节点的列（箭头，该列自定义，与vxe无关）
                            }
                        },
                        tableBaseEvent: {                               // 基础表格的事件，参考vxe官方API(这里事件官方写什么名称就是什么，不能驼峰命名)，第5点有说明
                            // 'checkbox-change': this.selectChangeEvent
                        },
                        userFieldConfig: {                              // 展示用户列特殊处理(插槽优先级比默认的高)
                            userFields: ['owner'],                      // 需要展示用户卡片的列，该列的数据必须是用户数组
                            fieldMapUser: {                             // 自定义用户映射数据，配置映射的优先级最高，其次取row数据
                                owner: [{
                                    "oid": "OR:erd.cloud.foundation.principal.entity.User:1587007720672792577",
                                    "id": "1587007720672792577",
                                    "idKey": "erd.cloud.foundation.principal.entity.User",
                                    "createTime": "2022-10-31 09:05:00",
                                    "updateTime": "2022-10-31 09:05:00",
                                    "code": "1097",
                                    "name": "chensanyang",
                                    "displayNameCn": "陈三阳",
                                    "alphabetic": "chensanyang",
                                    "displayNameEn": "chensanyang",
                                    "status": "ACTIVE",
                                    "userType": "SYSTEM",
                                    "mobile": "13622378794",
                                    "email": "chensy@e-lean.cn",
                                    "avatar": "./static/images/avatar/Avatar-12.png",
                                    "principalTarget": "USER",
                                    "isEnable": false,
                                    "displayName": "陈三阳"
                                }]
                            }
                        },
                        pagination: {                                   // 分页
                            showPagination: false,                      // 是否显示分页
                            pageSize: 20,
                            indexKey: 'page',                           // 参数pageIndex key (默认pageIndex)
                            sizeKey: 'size',                            // 参数pageSize key (默认pageSize)
                        },
                        columns: []                                     // 参考3的columns配置说明（这里如果不接口查询列，则需要配置）
                    }
                }
  
            },
            methods: {
                fnTableData(tableData){
			
		},
		callback(resp, columnsHead){
			// resp：表格数据接口返回的结果，整体
			// columnsHead: 表格列，全量的，包含每次列设置后新生成的逻辑
		},
		fnHandlerTableData(tableData){
			let handlerTableData = []
			// tableData: 表格数据（如果需要序列化的，这里已经是处理好的数据，表格有配置是否需要序列化，也可以不做序列化），可以自定义处理显示的数据，然后return
			// 处理逻辑
			return handlerTableData	// 处理好的数据返回让表格显示
		}
            }
        })
```

## 2.1、columns配置格式（更多配置可参考vxe官方文档）

* ### 必须字段：

| 属性     | 说明     | 类型   | 是否必须 |
| -------- | -------- | ------ | -------- |
| attrName | 属性名   | string | 是       |
| label    | 表格显示 | string | 是       |

* ### 参考完整代码：

```json
[
    {
        prop: 'checkbox',// 列数据字段key
        type: 'checkbox',// 特定类型 复选框[checkbox] 单选框[radio]
        minWidth: '60',// 列宽度
        width: '60',
        fixed: '',// 是否固定列
    },
    {
        "oid": "OR:erd.cloud.foundation.type.entity.AttributeDefinition:1562274604570284034", // 属性oid
        "attrName": "tableKey", // 属性key
        "label": "内部名称",    // 属性名称
        "inputType": "String",  // 属性类型
        "fieldType": "erd-input",
        "hide": false,          // 是否隐藏
        "baseField": false,
        "filterAble": true,     // 是否可过滤
        "sortAble": true,       // 是否可排序
        "editAble": false,      // 是否可编辑
        "referenceList": [],
        "componentRef": "OR:erd.cloud.foundation.layout.entity.Component:1568185245174337537",
        "componentName": "erd-input",       // 组件名
        "dataKey": "",
        "filter": {                                           // 过滤设置，有这个属性，基础表格才会显示过滤
            "type": "dynamicFilter",                          // 类型有6中，要了解去看基础表格示例，这里的dynamicFilter是动态过滤组件
            "componentName": "custom-text-input",             // 组件名称，dynamicFilter类型必须设置，否则没有过滤表单输入
            "operationList": [                                // 过滤组件中的操作下拉数据源
                {
                    "display": "等于",
                    "value": "="
                },
                {
                    "display": "不等于",
                    "value": "<>"
                },
                {
                    "display": "包含",
                    "value": "IN"
                },
                {
                    "display": "不包含",
                    "value": "NOT IN"
                },
                {
                    "display": "相似",
                    "value": "LIKE"
                },
                {
                    "display": "不相似",
                    "value": "NOT LIKE"
                },
                {
                    "display": "为空",
                    "value": "IS NULL"
                },
                {
                    "display": "不为空",
                    "value": "IS NOT NULL"
                }
            ],
            "operVal": "",                                          // 操作下拉的v-model值
            "value": "",                                            // 过滤的v-model值
        },
        props: {                                                    // 配置vxe-column的属性，支持那些属性，去vxe官网查看，需要注意版本
            'class-name': 'my-table-form'
        }
    }
]
```

# 3、高级表格自定义事件

```js
@table-data="fnTableData"  // 表格数据源每次发生改变的时候，都会调用callback方法，参数为当前表格渲染数据源
@callback="callback"  // 数据接口查询完成后执行callback，参数1：为当前数据接口返回对象，参数2：当前表格全量的表头，如果有设置列功能，这参数就是设置后最新的逻辑
@handler-data="fnHandlerTableData"  // 处理表格显示的数据源，通过回调方法设置回显，该事件有两个参数，参数1：表格当前数据源，参数2：回调函数，传递新的数组作为表格回显数据
```

## 3.1、实现代码参考

```js
methods: {
    fnTableData(tableData){
      
    },
    callback(resp, columnsHead){
      // resp：表格数据接口返回的结果，整体
      // columnsHead: 表格列，全量的，包含每次列设置后新生成的逻辑
    },
    fnHandlerTableData(tableData){
      let handlerTableData = []
      // tableData: 表格数据（如果需要序列化的，这里已经是处理好的数据，表格有配置是否需要序列化，也可以不做序列化），可以自定义处理显示的数据，然后return
      // 处理逻辑
      return handlerTableData	// 处理好的数据返回让表格显示
    }
}
```

# 4、基础表格事件配置：在tableBaseEvent对象中配置，该对象放在viewTableConfig中（更多事件参考vxetable官网）

```js
tableBaseEvent: {
	'checkbox-all': this.selectAllEvent // 复选框全选
	'checkbox-change': this.selectChangeEvent // 复选框勾选事件
	'radio-change': this.radioChangeEvent // 单选按钮改变事件
	'clear-radio-row-event': this.clearRadioRowEvent // 清空选择
	'clear-filter': this.clearFilter 	// 清空过滤
}

```

## 4.1、基础表格事件实现代码

```js
methods: {
    /**
    * checkbox
    * 复选框
    * @checkbox-all="selectAllEvent"
    *@checkbox-change="selectChangeEvent"
    * 
    **/
    selectAllEvent(data) {
      
      const records = this.$refs['erdTable'].$table.getCheckboxRecords()
      
    },
    selectChangeEvent(data) {
      
      const records = this.$refs['erdTable'].$table.getCheckboxRecords()
      
    },
    /**
    * Radio 添加单选
    * @radio-change="radioChangeEvent"
    * @clear-radio-row-event="clearRadioRowEvent"
    * 
    **/
    clearRadioRowEvent() {
      this.selectRow = null
      this.$refs['erdTable'].$table.clearRadioRow()
    },
    radioChangeEvent({ row }) {
      
      this.selectRow = row
    }
}
```
