# 高级表格头部组件
## 1、HTML代码

```htmlmixed=
 <!-- 操作栏 -->
    <fam-table-toolbar ref="tableToolbar"
        :condition-dto-list-default="conditionDtoListComputed"
        :toolbar-config="toolbarConfig"
        :columns-header="columnsHeader"
        :condition-columns-list="conditionColumnsList"
        :table-select-data="selectTableData"
        @onsubmit="fnHeaderSubmit"
        @refresh="fnRefreshTable"
        @searchTable="fnSearchTable"
        @clearTagCondition="tagClearFilter"
        >
        <template #left:table:toolbar:first>
            <span>左侧前面追加</span>
        </template>
        <template #left:table:toolbar:end>
            <span>左侧后面追加</span>
        </template>
        <template #right:table:toolbar:first>
           <span>右侧前面追加</span>
        </template>
        <template #right:table:toolbar:end>
            <span>右侧后面追加</span>
        </template>
    </fam-table-toolbar>
```
## 2、js配置代码

```javascript=
toolbarConfig:{
        showConfigCol: true, // 是否显示配置列，默认显示
        showMoreSearch: true, // 是否显示高级搜索，默认显示
        fuzzySearch: {
            show: true, // 是否显示普通模糊搜索，默认显示
            placeholder: '请输入' // 输入框提示文字，默认请输入
        },
        moreOperateList: [
            {
                label: '批量导入',
                class: '',
                icon: '',
                disable: false,
                onclick:()=>{
                    
                }
            },
            {
                label: '批量导出',
                class: '',
                icon: '',
                disable: false,
                onclick:()=>{
                    
                }
            },
            {
                label: '批量移动',
                class: '',
                icon: '',
                disable: false,
                onclick:()=>{
                    
                }
            },
            {
                label: '批量删除',
                class: '',
                icon: '',
                disable: false,
                onclick:()=>{
                    
                }
            }
        ]
    }
```

