# Erdc FAM

eRDCloud-FAM, eRDCloud Foundation Architecture Management，eRDCloud 底座系统。

## Start Up

```shell
pnpm install --registry http://nexus.ddns.e-lead.cn/repository/elead-npm/
```

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

## Build Docker

1. 登录到镜像库
     ```shell
     docker login registry.cn-shenzhen.aliyuncs.com
     Username: eleadrd@elead
     Password: Elea202012D
     ```
2. 检查`package.json`文件`build`脚本指定的镜像名称与镜像标签

3. 以下示例通过预设的脚本构建

    ```shell
    npm run build:docker
    ```