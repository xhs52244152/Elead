# 1、HTML代码

```html
<div id="fam-viewtable-demo" class="fam-viewtable-demo-container">
    <fam-view-table :view-table-config="viewTableConfig" @callback="fnCallback">
<!--         <template #column:default:operation:content="{ scope }">
            <erd-button type="text">编辑</erd-button>
            <erd-button type="text">删除</erd-button>
        </template> -->
        <template v-for="slot in slotsNameList" v-slot:[slot]="{ scope }">
            <span>插槽内容</span>
        </template>
    </fam-view-table>
</div>
```

* 组件自定义事件参考高级表格的自定义事件，目前只支持三个，有需要的可以自行加逻辑。

# 2、js代码配置

```javascript
new Vue({
            el: '#fam-viewtable-demo',
            data() {
                return {
                }
            },
            components: {
                FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
            },
            computed: {
                slotsField(){
                    return [                                   // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'operation',
                            type: 'default'                         // 显示字段内容插槽
                        },
                        {
                            prop: 'erd.cloud.foundation.principal.entity.User#code', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                            type: 'default'                         // 显示字段内容插槽
                        }
                    ]
                },
                slotsNameList(){
                    return this.slotsField?.map(ite=>{
                        return `column:${ite.type}:${ite.prop}:content`
                    })
                },
                viewTableConfig(){
                    let config = {
                        tableKey: 'OrgUserTableView',                       
                        viewMenu: {                                         // 表格视图菜单导航栏组件配置
                            dataKey: 'data.tableViewVos'
                        },
                        saveAs: true,					                    // 是否显示另存为
                        tableConfig: {                                      // 视图的高级表格配置，使用继承方式，参考高级表格用法
                            toolbarConfig: {                                // 工具栏
                                showConfigCol: true,                        // 是否显示配置列，默认显示
                                showMoreSearch: true,                       // 是否显示高级搜索，默认显示
                                showRefresh: true,
                                fuzzySearch: {
                                    show: true,                             // 是否显示普通模糊搜索，默认显示
                                }
                            },
                            slotsField: this.slotsField,
                        },
                    }
                    return config
                }
            },
            methods: {
                fnCallback(tableData){
                    
                },
                fnEditor(){
                    this.$refs['famViewTable'].$refs['FamAdvancedTable']
                }
            }
        })
```
## 2.1、slots配置（视图这一块比较特殊，需要非常注意）

```javascript=
computed: {
                slotsField(){
                    return [                                   // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'operation',
                            type: 'default'                         // 显示字段内容插槽
                        },
                        {
                            prop: 'erd.cloud.foundation.principal.entity.User#code', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                            type: 'default'                         // 显示字段内容插槽
                        }
                    ]
                },
                slotsNameList(){
                    // 拼接插槽名称，注意：因为视图的attrName是类型+属性名的，里面包含了特殊字符，直接用#column:default:erd.cloud.foundation.principal.entity.User#code:content是无法显示插槽的，必须要先生成字符串，用变量的形式来传递
                    return this.slotsField?.map(ite=>{
                        return `column:${ite.type}:${ite.prop}:content`
                    })
                },
                viewTableConfig(){
                    let config = {
                        tableKey: 'OrgUserTableView',                       
                        viewMenu: {                                         // 表格视图菜单导航栏组件配置
                            dataKey: 'data.tableViewVos'
                        },
                        saveAs: true,					                    // 是否显示另存为
                        tableConfig: {                                      // 视图的高级表格配置，使用继承方式，参考高级表格用法
                            toolbarConfig: {                                // 工具栏
                                showConfigCol: true,                        // 是否显示配置列，默认显示
                                showMoreSearch: true,                       // 是否显示高级搜索，默认显示
                                showRefresh: true,
                                fuzzySearch: {
                                    show: true,                             // 是否显示普通模糊搜索，默认显示
                                }
                            },
                            slotsField: this.slotsField,    // 特别要注意，视图表格的数据头返回的attrName是类型+属性名的，因为不同类型存在相同的属性名，所以不能截取，prop就要拿完整的attrName
                        },
                    }
                    return config
                }
}
```

