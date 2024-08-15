# 公共组件：根据组件名映射对应的组件显示。

## 1、下拉框组件
### 1.1、props属性

| 属性          | 说明                                           | 类型                           | 默认值 |
| ------------- | ---------------------------------------------- | ------------------------------ | ------ |
| value         | 绑定值                                         | String, Object, Boolean, Array |        |
| row           | 配置行(下方介绍该对象的具体配置)               | Object                         |        |
| oper          | 操作表达式（例：【包含】操作表达式是要多选的） | String                         |        |
| disabledArray | 禁止操作的数据项（注意：该数组是项的value）                               | Array                          |        |
| collapseTags  | 是否tags，多选生效                             | Boolean                        |        |
| multiple              |   是否多选                                             |             Boolean                   |        |


1. virtual-select 通过接口查询数据源的下拉框（row配置）

```javascript=
row: {
        componentName: 'virtual-select', // 接口查询（组件名带virtual，如果特殊组件名要处理的，到混入文件里面处理，比如custom-virtual-role-select是角色下拉框，有固定配置）
        viewProperty: 'title', // 显示的label的key
        valueProperty: 'value' // 显示value的key
        requestConfig: {    // 请求接口的配置对象
            url: 'url',
            viewProperty: 'title', // 显示的label的key（如果里面也配置，取里面的）
            valueProperty: 'value' // 显示value的key（如果里面也配置，取里面的）
            // 其他的请求配置，比如参数，请求拦截，响应拦截等等，axios支持的都可以
        },
        clearNoData: true // value未匹配到option中数据时，清除数据项
    }
```
2. constant-select 固定数据源下拉框（row配置）
```javascript=
 row: {
        componentName: 'constant-select', // 固定
        viewProperty: 'title', // 显示的label的key
        valueProperty: 'value' // 显示value的key
        referenceList: [{
            name: '中',
            value: '50'
        }],
        clearNoData: true // value未匹配到option中数据时，清除数据项
    }
```
3. **如果需要配置特殊的组件映射显示下拉框，到fieldTypeMapping.js文件配置，如果有指定组件配置参数的，到fam_core>store里面配置**
4. **特殊组件名称命名规则：**
<font class="text-color-6" color="#2196f3"> 
        4.1. 固定数据源下拉框，组件名包含constant
        4.2. 接口下拉框：包含virtual，特殊具名组件，例：角色下拉框 custom-virtual-role-select, role-select这个key作为组件配置参数的key，在store里面配置。
        4.3. 例：群组下拉框 custom-virtual-group-select，group-select作为key在store配置组件的固定参数
</font>
5. **特殊组件使用参考：**
    <font class="text-color-7" color="#03a9f4">
        5.1 角色组件配置
                let roleCompName = 'custom-virtual-role-select'
                let roleComponentConf = this.fnComponentHandle(roleCompName, true) // 参数2设置为true则会返回组件配置的参数，默认false
                方法返回对象，{showComponent: '', componentConfigs: {}} showComponent是显示的注册组件，componentConfigs组件的固定配置参数，比如url,请求参数等等
        5.2 群组组件配置
            let groupCompName = 'custom-virtual-group-select'
            let groupComponentConf = this.fnComponentHandle(groupCompName, true)
            特殊使用可以参考参与者组件（FamParticipantSelect）代码
        5.3 特殊组件拓展逻辑：['virtual-role-select', 'virtual-group-select', 'virtual-enum-select']
        5.4 特殊组件，如果在外部不传请求配置，则默认取store里面的固定配置，也允许传入部分配置，最终这一部分配置会和store默认配置合并，传入的配置优先级高
    </font>
### 1.2、HTML代码

```htmlmixed=
<custom-select v-model="value" :row="row" @change="change" @callback="callback"></custom-select>
```
### 1.3、支持事件

```javascript=
change(vals){
    // 改变事件，返回当前选中的值
}
callback({ value,label,selected,field}){
    // value: 当前选项的值
    // label: 当前选中项的文本拼接，多个是逗号分割
    // selected: 当前选中项，完整对象
    // field: 当前行字段，即：row.field，行里面有就是有，没有就没有，使用场景不多
}
```

## 2、日期组件
### 2.1、props属性
| 属性  | 说明                                 | 类型          | 默认值 |
| ----- | ------------------------------------ | ------------- | ------ |
| value | 绑定值                               | String, Array |        |
| row   | 配置行(下方介绍该对象的具体配置)     | Object        |        |
| oper  | 操作表达式（例：【区间】是范围日期） | String        |        |

1. row配置
```javascript=
row: {
    componentName: 'date', // date-range: 范围日期，其他默认显示日期选择
    dateFormat: 'yyyy-MM-dd', // 日期格式，默认yyyy-MM-dd
    separator: '至',        // 区间分隔符
    startPlaceholder: '开始日期', // 开始日期提示语
    endPlaceholder: '', // 结束日期提示语
}
```

### 2.2 HTML
```htmlmixed=
<custom-date-time :row="row" :oper="oper" v-model="date"></custom-date-time>
```
