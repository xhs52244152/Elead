##升级指南
1. 拿到新迪前端文件，替换thirdpart下的对应目录
2. 移除文件中的多余部分，例如models文件夹、demo_xxx文件
3. 替换viewer.js中`document.querySelector("#iframeDiv").innerHTML`指向的页面`src`为`ELMP.resource('pdm_nds/thirdparty/3DView/index.html')`(2D同理)
4. 修改3DView/img/scene下的文件名，改为英文，相应的代码中的引用也做调整（这几张图片是干啥的啊）