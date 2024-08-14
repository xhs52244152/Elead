# Erdc FAM

eRDCloud-FAM, eRDCloud Foundation Architecture Management，eRDCloud 底座系统。

组件库地址：
http://erdcloud-ui.apps.paas.sz.ddns.e-lead.cn/

平台开发文档：
http://fam-doc.apps.paas.sz.ddns.e-lead.cn/#/docs/best-practices/sourcecode

## Start Up

node版本安装成16.14.2 不要安装其它版本，会有问题

```shell
npm install -g pnpm

pnpm install --registry http://nexus.ddns.e-lead.cn/repository/erdc-npm/ (第一次执行后，在以后就不用执行了，第一次执行需要输入账号密码邮箱，正常输入即可)

rm -rf node_modules && rm -f pnpm-lock.lock && pnpm store prune （第一次安装不需要执行这一段）

npm run serve
```

### 基础规范

参看 [《易立德产品研发团队 - 前端能力传递手册》](http://feh.apps.paas.sz.ddns.e-lead.cn/)。

特别注意：

1. 必须使用 [Prettier](https://prettier.io/) 检查代码样式,编辑器开启保存自动格式化代码
2. 使用 [ESLint](https://eslint.org/) 或 SonarQube (至少选择一个，SonarQube 指定服务器为 http://192.168.30.233:9000/) 检查代码问题；
3. vscode安装Live Sass Compiler插件，开启插件修改sass文件后会自动编译成css；

### 代码提交规范

向 `develop`、`master`、`hotfix`等分支合入代码必须提交 Merge Request，并按照`.gitlab/merge_request_templates/Default.md`制定的模板对合并内容进行详细描述[提交信息规范](http://win-data.ddns.e-lead.cn:10020/framework/#/docs/commitMessage?id=%e6%8f%90%e4%ba%a4%e4%bf%a1%e6%81%af%e8%a7%84%e8%8c%83)

## 单独运行应用

```shell
# 应用根目录
pnpm serve
```

## 本地运行微前端平台

1. 修改`configs/mfe-dev.conf`
   - 监听端口
   - `$webRoot`
   - 代理环境（要求是部署了微前端平台的环境）
2. 使用 Nginx 启动服务
