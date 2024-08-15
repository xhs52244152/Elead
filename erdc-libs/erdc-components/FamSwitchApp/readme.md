## 简介
    1. 内部会默认请求所有的菜单信息，并将一级菜单归为应用,如果要换,可以传递`apps`,对应的对象为: {url: xxx, code: xxx, text: xxx, children: []}
    2. 内部默认了跳转逻辑，如果要换，可以通过传递`handleGoto`
## 基本使用

1. 引入组件
```javascript
Navigation: FamKit.asyncComponent(ELMP.resource('erdc-components/FamSwitchApp/index.js'))
```
2. 使用组件
```html
  <navigation :visible.sync="visible"></navigation>
```

        